import { BaseCrawler } from './BaseCrawler';
import { CrawlResult } from '../types';
import { ImageDownloader } from '../utils/imageDownloader';

export class InstagramCrawler extends BaseCrawler {
  async crawl(url: string, maxPosts: number = 5): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    try {
      if (!this.page) throw new Error('Page not initialized');
      
      this.logger.info(`Starting Instagram crawl for: ${url}`);
      
      await this.navigateWithRetry(url);
      
      // Wait for posts grid to load
      const postsLoaded = await this.waitForSelector('article a, ._ac7v a, [role="main"] a');
      if (!postsLoaded) {
        this.logger.warn('No posts found on Instagram page');
        return results;
      }
      
      // Get post links
      const postLinks = await this.page.evaluate((max) => {
        const selectors = [
          'article a[href*="/p/"]',
          '._ac7v a[href*="/p/"]',
          'a[href*="/p/"]',
          'a[href*="/reel/"]'
        ];
        
        let links: string[] = [];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            links = Array.from(elements)
              .slice(0, max)
              .map(link => (link as HTMLAnchorElement).href)
              .filter(href => href.includes('/p/') || href.includes('/reel/'));
            break;
          }
        }
        
        return links;
      }, maxPosts);
      
      this.logger.info(`Found ${postLinks.length} Instagram post links`);
      
      // Crawl each post
      for (let i = 0; i < postLinks.length; i++) {
        const postUrl = postLinks[i];
        try {
          const postData = await this.crawlInstagramPost(postUrl, i);
          if (postData) {
            results.push({
              ...postData,
              source: url,
              platform: 'instagram',
              crawledAt: new Date()
            });
          }
        } catch (error) {
          this.logger.warn(`Failed to crawl Instagram post ${postUrl}:`, error);
        }
      }
      
      this.logger.info(`Instagram crawl completed: ${results.length} posts extracted`);
      
    } catch (error) {
      this.logger.error(`Instagram crawl failed for ${url}:`, error);
    }
    
    return results;
  }
  
  private async crawlInstagramPost(postUrl: string, index: number): Promise<Partial<CrawlResult> | null> {
    if (!this.page) return null;
    
    try {
      this.logger.info(`Crawling Instagram post ${index + 1}: ${postUrl}`);
      
      await this.navigateWithRetry(postUrl);
      
      // Wait for post content to load
      await this.waitForSelector('article, [role="main"]');
      
      // Extract post data
      const postData = await this.page.evaluate(() => {
        // Try to find caption
        const captionSelectors = [
          '[data-testid="post-caption"]',
          '.Caption',
          'meta[property="og:description"]',
          'article span',
          '._a9zs span'
        ];
        
        let title = '';
        for (const selector of captionSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            if (element.tagName === 'META') {
              title = (element as HTMLMetaElement).content;
            } else {
              title = element.textContent || '';
            }
            if (title.trim()) break;
          }
        }
        
        // Try to find image
        const imgSelectors = [
          'img[style*="object-fit"]',
          '.FFVAD img',
          'article img',
          '._aagu img',
          'img[src*="cdninstagram"]'
        ];
        
        let imageUrl = '';
        for (const selector of imgSelectors) {
          const imgElement = document.querySelector(selector);
          if (imgElement) {
            imageUrl = (imgElement as HTMLImageElement).src || '';
            if (imageUrl && (imageUrl.includes('cdninstagram') || imageUrl.includes('fbcdn'))) {
              break;
            }
          }
        }
        
        // Try to find date
        const timeSelectors = [
          'time',
          '[datetime]',
          '._aaqe time'
        ];
        
        let publishedAt = new Date().toISOString();
        for (const selector of timeSelectors) {
          const timeElement = document.querySelector(selector);
          if (timeElement) {
            const datetime = timeElement.getAttribute('datetime') || 
                           timeElement.getAttribute('title') || 
                           timeElement.textContent;
            if (datetime) {
              publishedAt = datetime;
              break;
            }
          }
        }
        
        return {
          title: title.substring(0, 500),
          imageUrl: imageUrl,
          articleUrl: window.location.href,
          publishedAt: publishedAt
        };
      });
      
      // Download image if exists
      if (postData.imageUrl) {
        try {
          const localImagePath = await ImageDownloader.downloadImage(
            postData.imageUrl, 
            'instagram', 
            `post_${index}`
          );
          if (localImagePath) {
            postData.localImagePath = localImagePath;
          }
        } catch (error) {
          this.logger.warn(`Failed to download image: ${error}`);
        }
      }
      
      return {
        title: postData.title,
        imageUrl: postData.imageUrl,
        localImagePath: postData.localImagePath,
        articleUrl: postData.articleUrl,
        publishedAt: new Date(postData.publishedAt)
      };
      
    } catch (error) {
      this.logger.error(`Failed to extract Instagram post data:`, error);
      return null;
    }
  }
}
