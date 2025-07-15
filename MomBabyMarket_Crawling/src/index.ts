import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import pLimit from 'p-limit';

import { crawlTargets, crawlerConfig } from './config/targets';
import { FacebookCrawler } from './crawlers/FacebookCrawler';
import { InstagramCrawler } from './crawlers/InstagramCrawler';
import { WebsiteCrawler } from './crawlers/WebsiteCrawler';
import { CrawlResult, CrawlStats } from './types';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

class CrawlerManager {
  private logger = Logger.getInstance();
  private stats: CrawlStats;
  private limit = pLimit(2); // Limit concurrent crawlers

  constructor() {
    this.stats = {
      totalTargets: crawlTargets.length,
      successfulTargets: 0,
      failedTargets: 0,
      totalPosts: 0,
      totalImages: 0,
      startTime: new Date()
    };
  }

  async start(): Promise<void> {
    try {
      this.logger.info('🚀 Starting MomBabyMarket Crawler');
      this.logger.info(`📊 Total targets: ${crawlTargets.length}`);
      
      // Ensure output directories exist
      await this.setupOutputDirectories();
      
      // Start crawling with concurrency limit
      const allResults: CrawlResult[] = [];
      
      const crawlPromises = crawlTargets.map(target => 
        this.limit(() => this.crawlTarget(target))
      );
      
      const results = await Promise.allSettled(crawlPromises);
      
      // Process results
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value);
          this.stats.successfulTargets++;
        } else {
          this.stats.failedTargets++;
          if (result.status === 'rejected') {
            this.logger.error('Crawl target failed:', result.reason);
          }
        }
      }
      
      // Update stats
      this.stats.totalPosts = allResults.length;
      this.stats.totalImages = allResults.filter(r => r.localImagePath).length;
      this.stats.endTime = new Date();
      this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
      
      // Save results
      await this.saveResults(allResults);
      
      // Print summary
      this.printSummary();
      
    } catch (error) {
      this.logger.error('Crawler manager failed:', error);
      throw error;
    }
  }

  private async crawlTarget(target: any): Promise<CrawlResult[]> {
    let crawler;
    
    try {
      this.logger.info(`🔍 Crawling ${target.platform}: ${target.name}`);
      
      // Create appropriate crawler
      switch (target.platform) {
        case 'facebook':
          crawler = new FacebookCrawler(crawlerConfig);
          break;
        case 'instagram':
          crawler = new InstagramCrawler(crawlerConfig);
          break;
        case 'website':
          crawler = new WebsiteCrawler(crawlerConfig);
          break;
        default:
          throw new Error(`Unknown platform: ${target.platform}`);
      }
      
      // Initialize and crawl
      await crawler.initialize();
      const results = await crawler.crawl(target.url, target.maxPosts);
      await crawler.cleanup();
      
      this.logger.info(`✅ ${target.name}: ${results.length} posts extracted`);
      
      return results;
      
    } catch (error) {
      this.logger.error(`❌ Failed to crawl ${target.name}:`, error);
      if (crawler) {
        await crawler.cleanup();
      }
      return [];
    }
  }

  private async setupOutputDirectories(): Promise<void> {
    const dirs = [
      process.env.OUTPUT_DIR || './data',
      process.env.IMAGES_DIR || './data/images',
      './data/images/facebook',
      './data/images/instagram',
      './data/images/website',
      './logs'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(dir);
    }
  }

  private async saveResults(results: CrawlResult[]): Promise<void> {
    try {
      const outputFile = process.env.JSON_OUTPUT || './data/crawled_data.json';
      
      // Save main results
      await fs.writeJson(outputFile, results, { spaces: 2 });
      this.logger.info(`💾 Results saved to: ${outputFile}`);
      
      // Save stats
      const statsFile = './data/crawl_stats.json';
      await fs.writeJson(statsFile, this.stats, { spaces: 2 });
      this.logger.info(`📊 Stats saved to: ${statsFile}`);
      
      // Create summary report
      await this.createSummaryReport(results);
      
    } catch (error) {
      this.logger.error('Failed to save results:', error);
    }
  }

  private async createSummaryReport(results: CrawlResult[]): Promise<void> {
    const report = {
      summary: this.stats,
      byPlatform: {
        facebook: results.filter(r => r.platform === 'facebook').length,
        instagram: results.filter(r => r.platform === 'instagram').length,
        website: results.filter(r => r.platform === 'website').length
      },
      bySource: {} as Record<string, number>
    };

    // Count by source
    for (const result of results) {
      const domain = new URL(result.source).hostname;
      report.bySource[domain] = (report.bySource[domain] || 0) + 1;
    }

    await fs.writeJson('./data/summary_report.json', report, { spaces: 2 });
  }

  private printSummary(): void {
    const duration = this.stats.duration ? Math.round(this.stats.duration / 1000) : 0;
    
    console.log('\n🎉 Crawling Complete!');
    console.log('====================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🎯 Targets: ${this.stats.successfulTargets}/${this.stats.totalTargets} successful`);
    console.log(`📄 Posts: ${this.stats.totalPosts} extracted`);
    console.log(`🖼️  Images: ${this.stats.totalImages} downloaded`);
    console.log(`📁 Output: ${process.env.JSON_OUTPUT || './data/crawled_data.json'}`);
    console.log('====================\n');
  }
}

// Main execution
async function main() {
  try {
    const manager = new CrawlerManager();
    await manager.start();
    console.log('✅ Crawler completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Crawler failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the crawler
if (require.main === module) {
  main();
}
