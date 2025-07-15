import { BaseCrawler } from './BaseCrawler';
import { CrawlResult } from '../types';
import { ImageDownloader } from '../utils/imageDownloader';

export class FacebookCrawler extends BaseCrawler {
  async crawl(url: string, maxPosts: number = 5): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    try {
      if (!this.page) throw new Error('Page not initialized');
      
      this.logger.info(`Starting Facebook crawl for: ${url}`);
      
      await this.navigateWithRetry(url);
      
      // Wait for posts to load
      const postsLoaded = await this.waitForSelector('[role="feed"], [data-pagelet="FeedUnit"], .userContentWrapper');
      if (!postsLoaded) {
        this.logger.warn('No posts found on Facebook page');
        return results;
      }
      
      // Scroll to load more posts
      await this.scrollToLoadPosts(maxPosts);
      
      // Extract post data
      const posts = await this.page.evaluate((max) => {
        const selectors = [
          '[role="feed"] > div',
          '[data-pagelet="FeedUnit"]',
          '.userContentWrapper',
          '._5pcr'
        ];
        
        let postElements: NodeListOf<Element> | null = null;
        
        // Try different selectors
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            postElements = elements;
            break;
          }
        }
        
        if (!postElements) return [];
        
        const posts = [];
        
        for (let i = 0; i < Math.min(postElements.length, max); i++) {
          const post = postElements[i];
          
          try {
            // Extract title/content - try multiple selectors
            const contentSelectors = [
              '[data-ad-preview="message"]',
              '.userContent',
              '[dir="auto"]',
              '.text_exposed_root',
              'p',
              'span'
            ];
            
            let title = '';
            for (const selector of contentSelectors) {
              const element = post.querySelector(selector);
              if (element && element.textContent) {
                title = element.textContent.trim();
                break;
              }
            }
            
            // Extract image URL - try multiple selectors
            const imgSelectors = [
              'img[src*="scontent"]',
              'img[src*="fbcdn"]',
              'img[data-src*="scontent"]',
              '.spotlight img',
              '._46-i img'
            ];
            
            let imageUrl = '';
            for (const selector of imgSelectors) {
              const imgElement = post.querySelector(selector);
              if (imgElement) {
                imageUrl = imgElement.getAttribute('src') || 
                          imgElement.getAttribute('data-src') || '';
                if (imageUrl && imageUrl.includes('scontent')) {
                  break;
                }
              }
            }
            
            // Extract post URL
            const linkSelectors = [
              'a[href*="/posts/"]',
              'a[href*="/photos/"]',
              'a[href*="/videos/"]',
              '.timestamp a',
              '._5pcq a'
            ];
            
            let articleUrl = '';
            for (const selector of linkSelectors) {
              const linkElement = post.querySelector(selector);
              if (linkElement) {
                const href = linkElement.getAttribute('href') || '';
                if (href) {
                  articleUrl = href.startsWith('http') ? href : 'https://facebook.com' + href;
                  break;
                }
              }
            }
            
            if (title || imageUrl) {
              posts.push({
                title: title.substring(0, 500),
                imageUrl: imageUrl,
                articleUrl: articleUrl || window.location.href,
                publishedAt: new Date().toISOString() // Facebook dates are complex to parse
              });
            }
          } catch (error) {
            console.error('Error extracting post data:', error);
          }
        }
        
        return posts;
      }, maxPosts);
      
      // Process results
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const result: CrawlResult = {
          title: post.title,
          imageUrl: post.imageUrl,
          articleUrl: post.articleUrl,
          publishedAt: new Date(post.publishedAt),
          source: url,
          platform: 'facebook',
          crawledAt: new Date()
        };
        
        // Download image if exists
        if (result.imageUrl) {
          try {
            const localImagePath = await ImageDownloader.downloadImage(
              result.imageUrl, 
              'facebook', 
              `post_${i}`
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
      
      this.logger.info(`Facebook crawl completed: ${results.length} posts extracted`);
      
    } catch (error) {
      this.logger.error(`Facebook crawl failed for ${url}:`, error);
    }
    
    return results;
  }
  
  private async scrollToLoadPosts(targetCount: number): Promise<void> {
    if (!this.page) return;
    
    let loadedPosts = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5;
    
    while (loadedPosts < targetCount && scrollAttempts < maxScrollAttempts) {
      // Scroll down
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Wait for new content
      await this.page.waitForTimeout(3000);
      
      // Count current posts
      const currentPosts = await this.page.evaluate(() => {
        const selectors = [
          '[role="feed"] > div',
          '[data-pagelet="FeedUnit"]',
          '.userContentWrapper'
        ];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            return elements.length;
          }
        }
        return 0;
      });
      
      if (currentPosts > loadedPosts) {
        loadedPosts = currentPosts;
        scrollAttempts = 0; // Reset if we found new posts
      } else {
        scrollAttempts++;
      }
      
      this.logger.info(`Facebook scroll: ${currentPosts} posts loaded, attempt ${scrollAttempts}`);
    }
  }
}
