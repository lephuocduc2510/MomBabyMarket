const browserService = require('./browserService');
const imageService = require('./imageService');
const logger = require('../utils/logger');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const facebookCrawlerService = {
  async crawl(url, maxPosts = 5) {
    const results = [];
    let page = null;
    
    try {
      logger.info(`Starting Facebook crawl for: ${url}`);
      
      page = await browserService.createPage();
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: parseInt(process.env.TIMEOUT) || 30000 
      });
      
      // Wait for posts to load
      try {
        await page.waitForSelector('[role="feed"], [data-pagelet="FeedUnit"], .userContentWrapper', { timeout: 10000 });
      } catch (error) {
        logger.warn('No posts found on Facebook page');
        return results;
      }
      
      // Scroll to load more posts
      await this.scrollToLoadPosts(page, maxPosts);
      
      // Extract post data
      const posts = await page.evaluate((max) => {
        const selectors = [
          '[role="feed"] > div',
          '[data-pagelet="FeedUnit"]',
          '.userContentWrapper',
          '._5pcr'
        ];
        
        let postElements = null;
        
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
            // Extract title/content
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
            
            // Extract image URL
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
                publishedAt: new Date().toISOString()
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
        
        let localImagePath = null;
        if (post.imageUrl) {
          localImagePath = await imageService.downloadImage(
            post.imageUrl, 
            'facebook', 
            `post_${i}`
          );
        }
        
        results.push({
          title: post.title || `Facebook Post ${i + 1}`,
          content: null,
          imageUrl: post.imageUrl,
          localImagePath: localImagePath,
          articleUrl: post.articleUrl,
          publishedAt: new Date(post.publishedAt),
          source: url,
          platform: 'facebook',
          crawledAt: new Date()
        });
      }
      
      logger.info(`Facebook crawl completed: ${results.length} posts extracted`);
      
    } catch (error) {
      logger.error(`Facebook crawl failed for ${url}:`, error);
    } finally {
      if (page) await browserService.closePage(page);
    }
    
    return results;
  },
  
  async scrollToLoadPosts(page, targetCount) {
    let loadedPosts = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5;
    
    while (loadedPosts < targetCount && scrollAttempts < maxScrollAttempts) {
      // Scroll down
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      // Wait for new content
      await delay(3000);
      
      // Count current posts
      const currentPosts = await page.evaluate(() => {
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
      
      logger.info(`Facebook scroll: ${currentPosts} posts loaded, attempt ${scrollAttempts}`);
    }
  }
};

module.exports = facebookCrawlerService;
