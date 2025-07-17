const browserService = require('./browserService');
const imageService = require('./imageService');
const logger = require('../utils/logger');
const fileService = require('./fileService'); // Thêm semicolon
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
];

const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const instagramCrawlerService = {
  async crawl(url, maxPosts = 5, name) {
    const results = [];
    let page = null;

    try {
      logger.info(`Starting Instagram crawl for: ${url}`);

      page = await browserService.createPage();

      // Set random User Agent
      await page.setUserAgent(getRandomUserAgent());

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      });

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000, // Tăng timeout
      });

      // Add random delay to mimic human behavior
      await delay(Math.random() * 3000 + 2000);

      // Simulate scrolling
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await delay(2000);

      // Debug: Take screenshot to see what's happening
      try {
        await page.screenshot({ path: `debug_instagram_${Date.now()}.png` });
        logger.info('Debug screenshot saved');
      } catch (err) {
        logger.warn('Could not take screenshot');
      }

      // Wait for posts grid to load with multiple attempts
      const selectors = [
        'article a, ._ac7v a, [role="main"] a',
        'a[href*="/p/"]',
        'a[href*="/reel/"]',
        '[role="main"] div[style*="flex"] a',
        '._aagu a',
        '._ac7v a',
      ];

      let selectorFound = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
          logger.info(`✅ Found content with selector: ${selector}`);
          selectorFound = true;
          break;
        } catch (error) {
          logger.debug(`❌ Selector failed: ${selector}`);
        }
      }

      if (!selectorFound) {
        logger.warn('No post selectors found. Checking page content...');
        
        // Debug: Log page content
        const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
        logger.info(`Page content preview: ${bodyText}`);
        
        return results;
      }

      // Get post links with updated selectors
      const postLinks = await page.evaluate((max) => {
        const selectors = [
          'article a[href*="/p/"]',
          'article a[href*="/reel/"]',
          '._ac7v a[href*="/p/"]',
          '._ac7v a[href*="/reel/"]',
          'a[href*="/p/"]',
          'a[href*="/reel/"]',
          '[role="main"] a[href*="/p/"]',
          '[role="main"] a[href*="/reel/"]',
          '._aagu a[href*="/p/"]',
          '._aagu a[href*="/reel/"]',
        ];

        let links = [];
        let foundSelector = '';

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          console.log(`Selector: ${selector}, Found: ${elements.length} elements`);
          
          if (elements.length > 0) {
            links = Array.from(elements)
              .map(link => link.href)
              .filter(href => href.includes('/p/') || href.includes('/reel/'))
              .slice(0, max);
            foundSelector = selector;
            break;
          }
        }

        return { links, foundSelector, totalElements: document.querySelectorAll('a').length };
      }, maxPosts);

      logger.info(`Post extraction result:`);
      logger.info(`  - Selector used: ${postLinks.foundSelector}`);
      logger.info(`  - Total links on page: ${postLinks.totalElements}`);
      logger.info(`  - Post links found: ${postLinks.links.length}`);

      if (postLinks.links.length === 0) {
        logger.warn('No Instagram post links found. This could be due to:');
        logger.warn('  1. Instagram changed their HTML structure');
        logger.warn('  2. Page requires login');
        logger.warn('  3. Profile is private');
        logger.warn('  4. Instagram is blocking automated access');
        return results;
      }

      // Crawl each post
      for (let i = 0; i < postLinks.links.length; i++) {
        const postUrl = postLinks.links[i];
        try {
          const postData = await this.crawlPost(page, postUrl, i, name);
          if (postData) {
            const fullResult = {
              title: postData.title || `Instagram Post ${i + 1}`,
              content: postData.content || null,
              imageUrl: postData.imageUrl || null,
              localImagePath: postData.localImagePath || null,
              articleUrl: postData.articleUrl || postUrl,
              publishedAt: postData.publishedAt || new Date(),
              source: url,
              platform: 'instagram',
              crawledAt: new Date(),
            };

            results.push(fullResult);
            await fileService.appendResult(fullResult);

            logger.info(`✅ Instagram Post ${i + 1} processed successfully:`);
            logger.info(`   📝 Title: "${fullResult.title.substring(0, 80)}..."`);
            logger.info(`   🖼️  Image: ${fullResult.imageUrl ? 'Available' : 'None'}`);
            logger.info(`   💾 Local Image: ${fullResult.localImagePath ? 'Saved' : 'None'}`);
          }
        } catch (error) {
          logger.warn(`Failed to crawl Instagram post ${postUrl}:`, error.message);
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

  async crawlPost(page, postUrl, index, name) {
    try {
      logger.info(`Crawling Instagram post ${index + 1}: ${postUrl}`);

      await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 30000 });

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
          '._a9zs span',
          'h1', // Thêm selector cho title
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
            if (title.trim() && title.length > 10) break; // Đảm bảo title có nghĩa
          }
        }

        // Try to find image
        const imgSelectors = [
          'img[style*="object-fit"]',
          '.FFVAD img',
          'article img',
          '._aagu img',
          'img[src*="cdninstagram"]',
          'img[src*="fbcdn"]', // Thêm fbcdn
        ];

        let imageUrl = '';
        for (const selector of imgSelectors) {
          const imgElement = document.querySelector(selector);
          if (imgElement) {
            imageUrl = imgElement.src || '';
            if (imageUrl && (imageUrl.includes('cdninstagram') || imageUrl.includes('fbcdn') || imageUrl.startsWith('http'))) {
              break;
            }
          }
        }

        // Try to find date
        const timeSelectors = ['time', '[datetime]', '._aaqe time'];

        let publishedAt = new Date().toISOString();
        for (const selector of timeSelectors) {
          const timeElement = document.querySelector(selector);
          if (timeElement) {
            const datetime =
              timeElement.getAttribute('datetime') ||
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
          publishedAt: publishedAt,
        };
      });

      // Download image if available
      let localImagePath = null;
      if (basicData.imageUrl) {
        logger.info(`📸 Downloading Instagram image for post ${index + 1}...`);
        try {
          localImagePath = await imageService.downloadImage(
            basicData.imageUrl,
            'instagram',
            name, // Pass the name from targets.js
            `post_${index + 1}`
          );
          
          if (localImagePath) {
            logger.info(`✅ Image downloaded successfully: ${localImagePath}`);
          } else {
            logger.warn(`❌ Failed to download image for post ${index + 1}`);
          }
        } catch (imageError) {
          logger.error(`❌ Image download error for post ${index + 1}:`, imageError.message);
          localImagePath = null;
        }
      } else {
        logger.info(`ℹ️  No image found for post ${index + 1}`);
      }

      return {
        title: basicData.title || `Instagram Post ${index + 1}`,
        content: null,
        imageUrl: basicData.imageUrl,
        localImagePath: localImagePath,
        articleUrl: basicData.articleUrl,
        publishedAt: new Date(basicData.publishedAt),
      };
    } catch (error) {
      logger.error(`Failed to extract Instagram post data:`, error);
      return null;
    }
  },
};

module.exports = instagramCrawlerService;