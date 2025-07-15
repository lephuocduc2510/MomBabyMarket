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
      
      // Set viewport and user agent to avoid detection
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: parseInt(process.env.TIMEOUT) || 30000 
      });
      
      // Wait for page to fully load
      await delay(5000);
      
      // Try multiple selectors for 2024/2025 Facebook
      const postSelectors = [
        '[role="main"] [role="article"]',     // New Facebook structure
        '[data-pagelet*="ProfileTimeline"]',  // Profile timeline
        '[aria-label*="Timeline"]',           // Timeline container
        'div[data-pagelet] div[role="article"]', // Nested articles
        '[role="feed"] > div > div',          // Feed items
        'div[style*="transform"] [role="article"]' // Virtualized content
      ];
      
      let postsFound = false;
      
      for (const selector of postSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          const count = await page.evaluate((sel) => {
            return document.querySelectorAll(sel).length;
          }, selector);
          
          if (count > 0) {
            logger.info(`✅ Found ${count} posts using selector: ${selector}`);
            postsFound = true;
            break;
          }
        } catch (error) {
          logger.debug(`Selector failed: ${selector}`);
        }
      }
      
      if (!postsFound) {
        // Try scrolling first to load content
        await page.evaluate(() => {
          window.scrollTo(0, 1000);
        });
        await delay(3000);
        
        // Check again after scroll
        for (const selector of postSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            postsFound = true;
            break;
          } catch (error) {
            continue;
          }
        }
      }
      
      if (!postsFound) {
        logger.warn('No posts found on Facebook page after trying all selectors');
        return results;
      }
      
      // Extract posts with updated selectors
      const posts = await page.evaluate((max) => {
        // Updated selectors for current Facebook
        const postSelectors = [
          '[role="main"] [role="article"]',
          '[data-pagelet*="ProfileTimeline"] [role="article"]',
          '[role="feed"] > div > div',
          'div[data-pagelet] div[role="article"]'
        ];
        
        let postElements = [];
        
        for (const selector of postSelectors) {
          const elements = Array.from(document.querySelectorAll(selector));
          if (elements.length > 0) {
            postElements = elements;
            console.log(`Using selector: ${selector}, found ${elements.length} posts`);
            break;
          }
        }
        
        if (postElements.length === 0) return [];
        
        const posts = [];
        
        // Take only first N posts (newest first)
        for (let i = 0; i < Math.min(postElements.length, max); i++) {
          const post = postElements[i];
          
          try {
            // Updated content selectors for 2024/2025
            const contentSelectors = [
              '[data-ad-preview="message"]',
              '[style*="text-align: start"]',
              'div[dir="auto"]',
              '[role="article"] span[dir="auto"]',
              '[role="article"] div[lang]',
              'div[data-ad-comet-preview="message"]'
            ];
            
            let title = '';
            for (const selector of contentSelectors) {
              const elements = post.querySelectorAll(selector);
              for (const element of elements) {
                if (element && element.textContent && element.textContent.trim().length > 10) {
                  title = element.textContent.trim();
                  break;
                }
              }
              if (title) break;
            }
            
            // Updated image selectors
            const imgSelectors = [
              'img[src*="scontent"]',
              'img[src*="fbcdn"]',
              'img[data-src*="scontent"]',
              '[role="article"] img[referrerpolicy]',
              'div[role="button"] img'
            ];
            
            let imageUrl = '';
            for (const selector of imgSelectors) {
              const imgElement = post.querySelector(selector);
              if (imgElement) {
                imageUrl = imgElement.getAttribute('src') || 
                          imgElement.getAttribute('data-src') || '';
                if (imageUrl && (imageUrl.includes('scontent') || imageUrl.includes('fbcdn'))) {
                  break;
                }
              }
            }
            
            // Updated link selectors
            const linkSelectors = [
              'a[href*="/posts/"]',
              'a[href*="/photos/"]',
              'a[href*="/videos/"]',
              '[role="article"] a[role="link"]',
              'a[aria-label*="ago"]'
            ];
            
            let articleUrl = '';
            for (const selector of linkSelectors) {
              const linkElement = post.querySelector(selector);
              if (linkElement) {
                const href = linkElement.getAttribute('href') || '';
                if (href && (href.includes('/posts/') || href.includes('/photos/'))) {
                  articleUrl = href.startsWith('http') ? href : 'https://facebook.com' + href;
                  break;
                }
              }
            }
            
            // Only include posts with content
            if (title && title.length > 5) {
              posts.push({
                title: title.substring(0, 500),
                imageUrl: imageUrl,
                articleUrl: articleUrl || window.location.href,
                publishedAt: new Date().toISOString(),
                postIndex: i + 1
              });
              
              console.log(`✅ Extracted post ${i + 1}: "${title.substring(0, 50)}..."`);
            }
          } catch (error) {
            console.error('Error extracting post data:', error);
          }
        }
        
        return posts;
      }, maxPosts);
      
      logger.info(`📊 Raw extraction: ${posts.length} posts found`);
      
      // Process results
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        
        let localImagePath = null;
        if (post.imageUrl) {
          localImagePath = await imageService.downloadImage(
            post.imageUrl, 
            'facebook', 
            `post_${i + 1}`
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
        
        logger.info(`✅ Processed Facebook post ${i + 1}/${posts.length}: "${post.title.substring(0, 50)}..."`);
      }
      
      logger.info(`🎉 Facebook crawl completed: ${results.length}/${maxPosts} posts extracted`);
      
    } catch (error) {
      logger.error(`❌ Facebook crawl failed for ${url}:`, error);
    } finally {
      if (page) await browserService.closePage(page);
    }
    
    return results;
  }
};

module.exports = facebookCrawlerService;
