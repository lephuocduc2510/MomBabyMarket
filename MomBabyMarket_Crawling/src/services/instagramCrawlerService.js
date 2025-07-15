const browserService = require('./browserService');
const imageService = require('./imageService');
const logger = require('../utils/logger');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const instagramCrawlerService = {
  async crawl(url, maxPosts = 5) {
    const results = [];
    let page = null;
    
    try {
      logger.info(`Starting Instagram crawl for: ${url}`);
      
      page = await browserService.createPage();
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: parseInt(process.env.TIMEOUT) || 30000 
      });
      
      // Wait for posts grid to load
      try {
        await page.waitForSelector('article a, ._ac7v a, [role="main"] a', { timeout: 10000 });
      } catch (error) {
        logger.warn('No posts found on Instagram page');
        return results;
      }
      
      // Get post links
      const postLinks = await page.evaluate((max) => {
        const selectors = [
          'article a[href*="/p/"]',
          '._ac7v a[href*="/p/"]',
          'a[href*="/p/"]',
          'a[href*="/reel/"]'
        ];
        
        let links = [];
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            links = Array.from(elements)
              .slice(0, max)
              .map(link => link.href)
              .filter(href => href.includes('/p/') || href.includes('/reel/'));
            break;
          }
        }
        
        return links;
      }, maxPosts);
      
      logger.info(`Found ${postLinks.length} Instagram post links`);
      
      // Crawl each post
      for (let i = 0; i < postLinks.length; i++) {
        const postUrl = postLinks[i];
        try {
          const postData = await this.crawlPost(page, postUrl, i);
          if (postData) {
            results.push({
              title: postData.title || `Instagram Post ${i + 1}`,
              content: postData.content,
              imageUrl: postData.imageUrl,
              localImagePath: postData.localImagePath,
              articleUrl: postData.articleUrl || postUrl,
              publishedAt: postData.publishedAt || new Date(),
              source: url,
              platform: 'instagram',
              crawledAt: new Date()
            });
          }
        } catch (error) {
          logger.warn(`Failed to crawl Instagram post ${postUrl}:`, error);
        }
      }
      
      logger.info(`Instagram crawl completed: ${results.length} posts extracted`);
      
    } catch (error) {
      logger.error(`Instagram crawl failed for ${url}:`, error);
    } finally {
      if (page) await browserService.closePage(page);
    }
    
    return results;
  },
  
  async crawlPost(page, postUrl, index) {
    try {
      logger.info(`Crawling Instagram post ${index + 1}: ${postUrl}`);
      
      await page.goto(postUrl, { waitUntil: 'networkidle2' });
      
      // Wait for post content to load
      try {
        await page.waitForSelector('article, [role="main"]', { timeout: 5000 });
      } catch (error) {
        logger.warn('Post content not found, continuing...');
      }
      
      // Extract post data
      const basicData = await page.evaluate(() => {
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
              title = element.content;
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
            imageUrl = imgElement.src || '';
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
      
      // Download image
      let localImagePath = null;
      if (basicData.imageUrl) {
        localImagePath = await imageService.downloadImage(
          basicData.imageUrl, 
          'instagram', 
          `post_${index}`
        );
      }
      
      return {
        title: basicData.title,
        imageUrl: basicData.imageUrl,
        localImagePath: localImagePath,
        articleUrl: basicData.articleUrl,
        publishedAt: new Date(basicData.publishedAt)
      };
      
    } catch (error) {
      logger.error(`Failed to extract Instagram post data:`, error);
      return null;
    }
  }
};

module.exports = instagramCrawlerService;
