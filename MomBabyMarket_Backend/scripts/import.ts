import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB, disconnectDB, Product } from '../models';

// Load environment variables
dotenv.config();

interface CrawledProductData {
  id: number;
  title: string;
  imageUrl: string;
  articleUrl: string;
  localImagePath: string;
  source: string;
  platform: string;
  crawledAt: string;
}

class DataImporter {
  private jsonFilePath: string;

  constructor(jsonFilePath: string) {
    this.jsonFilePath = jsonFilePath;
  }

  /**
   * Read and parse JSON file
   */
  private async readJsonFile(): Promise<CrawledProductData[]> {
    try {
      if (!fs.existsSync(this.jsonFilePath)) {
        throw new Error(`File not found: ${this.jsonFilePath}`);
      }

      const fileContent = fs.readFileSync(this.jsonFilePath, 'utf-8');
      const data = JSON.parse(fileContent);

      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of products');
      }

      console.log(`📄 Found ${data.length} products in JSON file`);
      return data;
    } catch (error) {
      console.error('❌ Error reading JSON file:', error);
      throw error;
    }
  }

  /**
   * Validate product data
   */
  private validateProduct(product: any, index: number): boolean {
    const requiredFields = ['id', 'title', 'imageUrl', 'articleUrl', 'localImagePath', 'source', 'platform', 'crawledAt'];
    
    for (const field of requiredFields) {
      if (!product[field]) {
        console.warn(`⚠️  Product at index ${index} missing required field: ${field}`);
        return false;
      }
    }

    // Validate URLs
    const urlFields = ['imageUrl', 'articleUrl', 'source'];
    for (const field of urlFields) {
      if (!/^https?:\/\/.+/.test(product[field])) {
        console.warn(`⚠️  Product at index ${index} has invalid ${field}: ${product[field]}`);
        return false;
      }
    }

    // Validate date
    const crawledDate = new Date(product.crawledAt);
    if (isNaN(crawledDate.getTime())) {
      console.warn(`⚠️  Product at index ${index} has invalid crawledAt date: ${product.crawledAt}`);
      return false;
    }

    return true;
  }

  /**
   * Transform data for MongoDB
   */
  private transformProduct(product: CrawledProductData): any {
    return {
      id: product.id,
      title: product.title.trim(),
      imageUrl: product.imageUrl,
      articleUrl: product.articleUrl,
      localImagePath: product.localImagePath,
      source: product.source,
      platform: product.platform || 'website',
      crawledAt: new Date(product.crawledAt)
    };
  }

  /**
   * Import products to MongoDB
   */
  async importProducts(options: { 
    clearExisting?: boolean; 
    batchSize?: number;
    skipDuplicates?: boolean;
  } = {}): Promise<void> {
    const { clearExisting = false, batchSize = 100, skipDuplicates = true } = options;

    try {
      // Connect to database
      await connectDB();

      // Clear existing data if requested
      if (clearExisting) {
        console.log('🗑️  Clearing existing products...');
        await Product.deleteMany({});
        console.log('✅ Existing products cleared');
      }

      // Read and validate data
      const rawProducts = await this.readJsonFile();
      const validProducts: any[] = [];

      console.log('🔍 Validating products...');
      for (let i = 0; i < rawProducts.length; i++) {
        if (this.validateProduct(rawProducts[i], i)) {
          validProducts.push(this.transformProduct(rawProducts[i]));
        }
      }

      console.log(`✅ ${validProducts.length} valid products out of ${rawProducts.length} total`);

      if (validProducts.length === 0) {
        console.log('⚠️  No valid products to import');
        return;
      }

      // Import in batches
      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (let i = 0; i < validProducts.length; i += batchSize) {
        const batch = validProducts.slice(i, i + batchSize);
        console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validProducts.length / batchSize)} (${batch.length} products)...`);

        for (const product of batch) {
          try {
            if (skipDuplicates) {
              // Check if product already exists
              const existing = await Product.findOne({ id: product.id });
              if (existing) {
                skipped++;
                continue;
              }
            }

            await Product.create(product);
            imported++;
          } catch (error: any) {
            errors++;
            if (error.code === 11000) {
              console.warn(`⚠️  Duplicate product ID ${product.id}, skipping...`);
              skipped++;
            } else {
              console.error(`❌ Error importing product ID ${product.id}:`, error.message);
            }
          }
        }
      }

      console.log('\n📊 Import Summary:');
      console.log(`✅ Successfully imported: ${imported} products`);
      console.log(`⚠️  Skipped (duplicates): ${skipped} products`);
      console.log(`❌ Errors: ${errors} products`);
      console.log(`📁 Total in database: ${await Product.countDocuments()} products`);

    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    } finally {
      await disconnectDB();
    }
  }

  /**
   * Show import statistics
   */
  async showStats(): Promise<void> {
    try {
      await connectDB();

      const totalProducts = await Product.countDocuments();
      const platforms = await Product.aggregate([
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const latestProduct = await Product.findOne().sort({ crawledAt: -1 });
      const oldestProduct = await Product.findOne().sort({ crawledAt: 1 });

      console.log('\n📊 Database Statistics:');
      console.log(`📦 Total products: ${totalProducts}`);
      console.log('\n🏷️  By platform:');
      platforms.forEach(p => console.log(`   ${p._id}: ${p.count} products`));
      
      if (latestProduct && oldestProduct) {
        console.log(`\n📅 Date range:`);
        console.log(`   Latest: ${latestProduct.crawledAt.toISOString()}`);
        console.log(`   Oldest: ${oldestProduct.crawledAt.toISOString()}`);
      }

    } catch (error) {
      console.error('❌ Error getting stats:', error);
    } finally {
      await disconnectDB();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const jsonFile = args[1];

  if (!command) {
    console.log('📖 Usage:');
    console.log('  npm run import <json-file-path>     # Import products from JSON file');
    console.log('  npm run import:clear <json-file>    # Clear existing and import');
    console.log('  npm run import:stats                # Show database statistics');
    console.log('');
    console.log('📄 Example:');
    console.log('  npm run import ./data/products.json');
    console.log('  npm run import:clear ./data/products.json');
    console.log('  npm run import:stats');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'import':
        if (!jsonFile) {
          console.error('❌ Please provide JSON file path');
          process.exit(1);
        }
        const importer = new DataImporter(jsonFile);
        await importer.importProducts({ skipDuplicates: true });
        break;

      case 'import:clear':
        if (!jsonFile) {
          console.error('❌ Please provide JSON file path');
          process.exit(1);
        }
        const clearImporter = new DataImporter(jsonFile);
        await clearImporter.importProducts({ clearExisting: true });
        break;

      case 'import:stats':
        const statsImporter = new DataImporter(''); // Dummy path for stats
        await statsImporter.showStats();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }

    console.log('🎉 Operation completed successfully!');
    
  } catch (error) {
    console.error('💥 Operation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default DataImporter;
