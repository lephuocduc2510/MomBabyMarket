const browserService = require('./browserService');
const imageService = require('./imageService');
const fileService = require('./fileService');
const logger = require('../utils/logger');
const cheerio = require('cheerio');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const websiteCrawlerService = {
  async crawl(url, maxPosts = 5, name) {
    const results = [];
    let page = null;

    try {
      logger.info(`🌐 Starting website crawl for: ${url}`);

      page = await browserService.createPage();
      
      // Add random delay to avoid detection
      await delay(Math.random() * 2000 + 1000);

      // Navigate with retry and longer timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for content to load
      await page.waitForSelector('body', { timeout: 10000 });
      await delay(2000);

      const content = await page.content();
      const $ = cheerio.load(content);

      logger.info(`📄 Page loaded successfully: ${$('title').text()}`);

      // Route to specific crawler based on URL
      if (url.includes('emonos.mn')) {
        return await this.crawlEmonos($, url, maxPosts, name, page);
      } else if (url.includes('jivh-hurgelt.mn')) {
        return await this.crawlJivhHurgelt($, url, maxPosts, name, page);
      } else if (url.includes('babyworld.mn')) {
        return await this.crawlBabyWorld($, url, maxPosts, name, page);
      } else if (url.includes('nomin.mn')) {
        return await this.crawlNomin($, url, maxPosts, name, page);
      } else {
        return await this.crawlGenericWebsite($, url, maxPosts, name, page);
      }

    } catch (error) {
      logger.error(`❌ Website crawl failed for ${url}:`, error);
      return results;
    } finally {
      if (page) await browserService.closePage(page);
    }
  },

  async crawlEmonos($, url, maxPosts, name, page) {
    const results = [];
    try {
      logger.info(`🛍️ Crawling Emonos website...`);

      // Enhanced selectors for Emonos
      const productSelectors = [
        '.product-item',
        '.product-card', 
        '.item-product',
        '.product',
        '[data-product]',
        '.product-box',
        '.item',
        '.product-wrapper',
        'article',
        '.card'
      ];

      let products = null;
      let usedSelector = '';

      // Try each selector
      for (const selector of productSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          products = elements;
          usedSelector = selector;
          logger.info(`✅ Found ${elements.length} products using selector: ${selector}`);
          break;
        }
      }

      // If no products found, try to extract single page content
      if (!products || products.length === 0) {
        logger.warn('No products found, extracting single page content...');
        return await this.extractSinglePageContent($, url, name);
      }

      // Process each product
      for (let i = 0; i < Math.min(products.length, maxPosts); i++) {
        const product = products.eq(i);

        // Enhanced title extraction
        const title = this.extractTitle(product) || `Emonos Product ${i + 1}`;

        // Enhanced link extraction
        const productLink = this.extractProductLink(product, url);

        // Enhanced image extraction
        const imageUrl = this.extractImageUrl(product, url);

        if (title && title.trim().length > 2) {
          let localImagePath = null;
          if (imageUrl) {
            try {
              localImagePath = await imageService.downloadImage(
                imageUrl, 
                'website', 
                name, 
                `emonos_${i + 1}`
              );
              logger.info(`✅ Downloaded image for product ${i + 1}`);
            } catch (imageError) {
              logger.warn(`❌ Failed to download image for product ${i + 1}:`, imageError.message);
            }
          }

          // ✅ Đồng nhất format với Facebook
          const result = {
            title: title.substring(0, 500),
            imageUrl: imageUrl || '',
            articleUrl: productLink || '',
            localImagePath: localImagePath,
            source: url,
            platform: 'website',
            crawledAt: new Date()
          };

          results.push(result);
          await fileService.appendResult(result);

          logger.info(`✅ Product ${i + 1} processed: "${title.substring(0, 50)}..."`);
        }

        // Add delay between products
        await delay(500);
      }

      logger.info(`🎉 Emonos crawl completed: ${results.length} products extracted`);
    } catch (error) {
      logger.error('❌ Error crawling Emonos:', error);
    }

    return results;
  },

  async crawlJivhHurgelt($, url, maxPosts, name, page) {
    const results = [];
    try {
      logger.info(`🛍️ Crawling Jivh Hurgelt website...`);

      // Selectors for Jivh Hurgelt
      const productSelectors = [
        '.product',
        '.product-item',
        '.item',
        '.product-card',
        'article',
        '.card',
        '.product-box'
      ];

      let products = null;
      for (const selector of productSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          products = elements;
          logger.info(`✅ Found ${elements.length} items using selector: ${selector}`);
          break;
        }
      }

      if (!products || products.length === 0) {
        return await this.extractSinglePageContent($, url, name);
      }

      for (let i = 0; i < Math.min(products.length, maxPosts); i++) {
        const product = products.eq(i);
        const title = this.extractTitle(product) || `Jivh Hurgelt Product ${i + 1}`;
        const productLink = this.extractProductLink(product, url);
        const imageUrl = this.extractImageUrl(product, url);

        if (title && title.trim().length > 2) {
          let localImagePath = null;
          if (imageUrl) {
            try {
              localImagePath = await imageService.downloadImage(
                imageUrl, 
                'website', 
                name, 
                `jivh_${i + 1}`
              );
            } catch (error) {
              logger.warn(`Failed to download image: ${error.message}`);
            }
          }

          // ✅ Đồng nhất format với Facebook
          const result = {
            title: title.substring(0, 500),
            imageUrl: imageUrl || '',
            articleUrl: productLink || '',
            localImagePath: localImagePath,
            source: url,
            platform: 'website',
            crawledAt: new Date()
          };

          results.push(result);
          await fileService.appendResult(result);

          logger.info(`✅ Jivh Hurgelt product ${i + 1} processed: "${title.substring(0, 50)}..."`);
        }
      }

      logger.info(`🎉 Jivh Hurgelt crawl completed: ${results.length} items extracted`);
    } catch (error) {
      logger.error('❌ Error crawling Jivh Hurgelt:', error);
    }

    return results;
  },

  async crawlBabyWorld($, url, maxPosts, name, page) {
    const results = [];
    try {
      logger.info(`🍼 Crawling Baby World website...`);

      // Similar implementation for Baby World
      return await this.crawlGenericWebsite($, url, maxPosts, name, page);
    } catch (error) {
      logger.error('❌ Error crawling Baby World:', error);
    }

    return results;
  },

  async crawlNomin($, url, maxPosts, name, page) {
    const results = [];
    try {
      logger.info(`🏪 Crawling Nomin website...`);

      // Similar implementation for Nomin
      return await this.crawlGenericWebsite($, url, maxPosts, name, page);
    } catch (error) {
      logger.error('❌ Error crawling Nomin:', error);
    }

    return results;
  },

  async crawlGenericWebsite($, url, maxPosts, name, page) {
    const results = [];
    try {
      logger.info(`🌐 Crawling generic website...`);

      // Generic selectors that work for most e-commerce sites
      const itemSelectors = [
        '.product', '.product-item', '.product-card',
        '.item', '.card', '.product-box',
        'article', '.post', '.entry',
        '[class*="product"]', '[class*="item"]',
        '.grid-item', '.list-item'
      ];

      let items = null;
      for (const selector of itemSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          items = elements;
          logger.info(`✅ Found ${elements.length} items using selector: ${selector}`);
          break;
        }
      }

      if (!items || items.length === 0) {
        return await this.extractSinglePageContent($, url, name);
      }

      for (let i = 0; i < Math.min(items.length, maxPosts); i++) {
        const item = items.eq(i);
        const title = this.extractTitle(item) || `Website Item ${i + 1}`;
        const itemLink = this.extractProductLink(item, url);
        const imageUrl = this.extractImageUrl(item, url);

        if (title && title.trim().length > 2) {
          let localImagePath = null;
          if (imageUrl) {
            try {
              localImagePath = await imageService.downloadImage(
                imageUrl, 
                'website', 
                name, 
                `generic_${i + 1}`
              );
            } catch (error) {
              logger.warn(`Failed to download image: ${error.message}`);
            }
          }

          // ✅ Đồng nhất format với Facebook
          const result = {
            title: title.substring(0, 500),
            imageUrl: imageUrl || '',
            articleUrl: itemLink || '',
            localImagePath: localImagePath,
            source: url,
            platform: 'website',
            crawledAt: new Date()
          };

          results.push(result);
          await fileService.appendResult(result);

          logger.info(`✅ Generic item ${i + 1} processed: "${title.substring(0, 50)}..."`);
        }
      }

      logger.info(`🎉 Generic website crawl completed: ${results.length} items extracted`);
    } catch (error) {
      logger.error('❌ Error crawling generic website:', error);
    }

    return results;
  },

  async extractSinglePageContent($, url, name) {
    const results = [];
    try {
      const pageTitle = $('title').text() || 
                       $('h1').first().text() || 
                       $('meta[property="og:title"]').attr('content') || 
                       'Website Page';

      const pageImage = $('meta[property="og:image"]').attr('content') ||
                       $('.main-image img, .hero-image img, .featured-image img').first().attr('src') ||
                       $('img').first().attr('src');

      let imageUrl = pageImage;
      if (imageUrl && !imageUrl.startsWith('http')) {
        try {
          imageUrl = new URL(imageUrl, url).href;
        } catch (error) {
          imageUrl = '';
        }
      }

      let localImagePath = null;
      if (imageUrl) {
        try {
          localImagePath = await imageService.downloadImage(imageUrl, 'website', name, 'page');
        } catch (error) {
          logger.warn(`Failed to download page image: ${error.message}`);
        }
      }

      // ✅ Đồng nhất format với Facebook
      const result = {
        title: pageTitle.trim().substring(0, 500),
        imageUrl: imageUrl || '',
        articleUrl: url,
        localImagePath: localImagePath,
        source: url,
        platform: 'website',
        crawledAt: new Date()
      };

      results.push(result);
      await fileService.appendResult(result);

      logger.info(`✅ Single page content extracted: "${pageTitle.substring(0, 50)}..."`);
    } catch (error) {
      logger.error('❌ Error extracting single page content:', error);
    }

    return results;
  },

  // Helper methods for better extraction
  extractTitle(element) {
    const titleSelectors = [
      '.product-name', '.product-title', '.title', '.name',
      'h1', 'h2', 'h3', 'h4', 'h5',
      '.heading', '.header',
      'a[title]', '[data-title]'
    ];

    for (const selector of titleSelectors) {
      const titleEl = element.find(selector).first();
      if (titleEl.length > 0) {
        const title = titleEl.text().trim() || titleEl.attr('title') || titleEl.attr('alt');
        if (title && title.length > 2) {
          return title;
        }
      }
    }

    // Fallback to link title or text content
    const linkTitle = element.find('a').first().attr('title');
    if (linkTitle) return linkTitle;

    const textContent = element.text().trim();
    if (textContent && textContent.length > 2 && textContent.length < 200) {
      return textContent;
    }

    return null;
  },

  extractProductLink(element, baseUrl) {
    const link = element.find('a').first().attr('href');
    if (!link) return null;

    try {
      return link.startsWith('http') ? link : new URL(link, baseUrl).href;
    } catch (error) {
      return null;
    }
  },

  extractImageUrl(element, baseUrl) {
    const imgSelectors = ['img', '.image img', '.photo img', '.thumbnail img'];
    
    for (const selector of imgSelectors) {
      const img = element.find(selector).first();
      if (img.length > 0) {
        const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy');
        if (src) {
          try {
            return src.startsWith('http') ? src : new URL(src, baseUrl).href;
          } catch (error) {
            continue;
          }
        }
      }
    }
    return null;
  }
};

module.exports = websiteCrawlerService;