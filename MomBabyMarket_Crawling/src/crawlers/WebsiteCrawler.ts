import { BaseCrawler } from './BaseCrawler';
import { CrawlResult } from '../types';
import { ImageDownloader } from '../utils/imageDownloader';
import cheerio from 'cheerio';

export class WebsiteCrawler extends BaseCrawler {
  async crawl(url: string, maxPosts: number = 5): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    try {
      if (!this.page) throw new Error('Page not initialized');
      
      this.logger.info(`Starting website crawl for: ${url}`);
      
      await this.navigateWithRetry(url);
      
      // Wait for content to load
      await this.waitForSelector('body');
      await this.page.waitForTimeout(3000);
      
      // Get page content
      const content = await this.page.content();
      const $ = cheerio.load(content);
      
      // Determine site type and extract accordingly
      if (url.includes('emonos.mn')) {
        return await this.crawlEmonos($, url, maxPosts);
      } else if (url.includes('jivh-hurgelt.mn')) {
        return await this.crawlJivhHurgelt($, url, maxPosts);
      } else if (url.includes('babyworld.mn')) {
        return await this.crawlBabyWorld($, url, maxPosts);
      } else if (url.includes('nomin.mn')) {
        return await this.crawlNomin($, url, maxPosts);
      } else {
        return await this.crawlGenericWebsite($, url, maxPosts);
      }
      
    } catch (error) {
      this.logger.error(`Website crawl failed for ${url}:`, error);
    }
    
    return results;
  }
  
  private async crawlEmonos($: cheerio.CheerioAPI, url: string, maxPosts: number): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    try {
      // Product selectors for emonos.mn
      const productSelectors = [
        '.product-item',
        '.product-card',
        '.item-product',
        '.product',
        '[data-product]'
      ];
      
      let products: cheerio.Cheerio<cheerio.Element> | null = null;
      
      for (const selector of productSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          products = elements;
          break;
        }
      }
      
      if (!products || products.length === 0) {
        // If no products found, try to extract page info
        const pageTitle = $('title').text() || $('h1').first().text();
        const pageImage = $('meta[property="og:image"]').attr('content') || 
                         $('.main-image img, .product-image img').first().attr('src');
        
        if (pageTitle) {
          const result: CrawlResult = {
            title: pageTitle.trim(),
            imageUrl: pageImage,
            articleUrl: url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          };
          
          if (result.imageUrl && !result.imageUrl.startsWith('http')) {
            result.imageUrl = new URL(result.imageUrl, url).href;
          }
          
          results.push(result);
        }
        
        return results;
      }
      
      // Extract product data
      for (let i = 0; i < Math.min(products.length, maxPosts); i++) {
        const product = products.eq(i);
        
        const title = product.find('.product-name, .product-title, h3, h4, .title').first().text().trim() ||
                     product.find('a').first().attr('title') || '';
        
        const productLink = product.find('a').first().attr('href') || '';
        const fullLink = productLink.startsWith('http') ? productLink : new URL(productLink, url).href;
        
        let imageUrl = product.find('img').first().attr('src') || 
                      product.find('img').first().attr('data-src') || '';
        
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = new URL(imageUrl, url).href;
        }
        
        if (title) {
          const result: CrawlResult = {
            title: title.substring(0, 500),
            imageUrl: imageUrl,
            articleUrl: fullLink || url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          };
          
          // Download image if exists
          if (result.imageUrl) {
            try {
              const localImagePath = await ImageDownloader.downloadImage(
                result.imageUrl, 
                'website', 
                `emonos_${i}`
              );
              if (localImagePath) {
                result.localImagePath = localImagePath;
              }
            } catch (error) {
              this.logger.warn(`Failed to download image: ${error}`);
            }
          }
          
          results.push(result);
        }
      }
      
    } catch (error) {
      this.logger.error('Error crawling Emonos:', error);
    }
    
    return results;
  }
  
  private async crawlJivhHurgelt($: cheerio.CheerioAPI, url: string, maxPosts: number): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    // Similar implementation for jivh-hurgelt.mn
    // ... (implementation details)
    
    return results;
  }
  
  private async crawlBabyWorld($: cheerio.CheerioAPI, url: string, maxPosts: number): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    // Similar implementation for babyworld.mn
    // ... (implementation details)
    
    return results;
  }
  
  private async crawlNomin($: cheerio.CheerioAPI, url: string, maxPosts: number): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    // Similar implementation for nomin.mn
    // ... (implementation details)
    
    return results;
  }
  
  private async crawlGenericWebsite($: cheerio.CheerioAPI, url: string, maxPosts: number): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    try {
      // Generic selectors for articles/products
      const contentSelectors = [
        'article',
        '.post',
        '.product',
        '.item',
        '.card',
        '.entry'
      ];
      
      let items: cheerio.Cheerio<cheerio.Element> | null = null;
      
      for (const selector of contentSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          items = elements;
          break;
        }
      }
      
      if (!items || items.length === 0) {
        // Extract page-level info
        const pageTitle = $('title').text() || $('h1').first().text();
        const pageImage = $('meta[property="og:image"]').attr('content') || 
                         $('img').first().attr('src');
        
        if (pageTitle) {
          results.push({
            title: pageTitle.trim(),
            imageUrl: pageImage,
            articleUrl: url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
        }
        
        return results;
      }
      
      // Extract content data
      for (let i = 0; i < Math.min(items.length, maxPosts); i++) {
        const item = items.eq(i);
        
        const title = item.find('h1, h2, h3, h4, .title, .name').first().text().trim();
        const link = item.find('a').first().attr('href') || '';
        const fullLink = link.startsWith('http') ? link : new URL(link, url).href;
        
        let imageUrl = item.find('img').first().attr('src') || 
                      item.find('img').first().attr('data-src') || '';
        
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = new URL(imageUrl, url).href;
        }
        
        if (title) {
          results.push({
            title: title.substring(0, 500),
            imageUrl: imageUrl,
            articleUrl: fullLink || url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
        }
      }
      
    } catch (error) {
      this.logger.error('Error in generic website crawl:', error);
    }
    
    return results;
  }
}
