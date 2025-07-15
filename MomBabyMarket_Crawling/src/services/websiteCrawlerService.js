const browserService = require('./browserService');
const imageService = require('./imageService');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

const websiteCrawlerService = {
  async crawl(url, maxPosts = 5) {
    const results = [];
    let page = null;
    
    try {
      logger.info(`Starting website crawl for: ${url}`);
      
      page = await browserService.createPage();
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: parseInt(process.env.TIMEOUT) || 30000 
      });
      
      // Wait for content to load
      await page.waitForSelector('body', { timeout: 5000 });
      await page.waitForTimeout(3000);
      
      // Get page content
      const content = await page.content();
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
      logger.error(`Website crawl failed for ${url}:`, error);
    } finally {
      if (page) await browserService.closePage(page);
    }
    
    return results;
  },
  
  async crawlEmonos($, url, maxPosts) {
    const results = [];
    
    try {
      // Product selectors for emonos.mn
      const productSelectors = [
        '.product-item',
        '.product-card',
        '.item-product',
        '.product',
        '[data-product]'
      ];
      
      let products = null;
      
      for (const selector of productSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          products = elements;
          break;
        }
      }
      
      if (!products || products.length === 0) {
        // If no products found, extract page info
        const pageTitle = $('title').text() || $('h1').first().text();
        const pageImage = $('meta[property="og:image"]').attr('content') || 
                         $('.main-image img, .product-image img').first().attr('src');
        
        if (pageTitle) {
          let imageUrl = pageImage;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, url).href;
          }
          
          let localImagePath = null;
          if (imageUrl) {
            localImagePath = await imageService.downloadImage(imageUrl, 'website', 'emonos_page');
          }
          
          results.push({
            title: pageTitle.trim(),
            content: null,
            imageUrl: imageUrl,
            localImagePath: localImagePath,
            articleUrl: url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
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
          let localImagePath = null;
          if (imageUrl) {
            localImagePath = await imageService.downloadImage(imageUrl, 'website', `emonos_${i}`);
          }
          
          results.push({
            title: title.substring(0, 500),
            content: null,
            imageUrl: imageUrl,
            localImagePath: localImagePath,
            articleUrl: fullLink || url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
        }
      }
      
    } catch (error) {
      logger.error('Error crawling Emonos:', error);
    }
    
    return results;
  },
  
  async crawlJivhHurgelt($, url, maxPosts) {
    const results = [];
    
    try {
      // Similar logic for jivh-hurgelt.mn
      const productSelectors = [
        '.product-item',
        '.product',
        '.item',
        '.card'
      ];
      
      let products = null;
      
      for (const selector of productSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          products = elements;
          break;
        }
      }
      
      if (!products || products.length === 0) {
        // Extract page info
        const pageTitle = $('title').text() || $('h1').first().text();
        if (pageTitle) {
          results.push({
            title: pageTitle.trim(),
            content: null,
            imageUrl: null,
            localImagePath: null,
            articleUrl: url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
        }
        return results;
      }
      
      // Extract product data (simplified)
      for (let i = 0; i < Math.min(products.length, maxPosts); i++) {
        const product = products.eq(i);
        const title = product.find('h1, h2, h3, .title, .name').first().text().trim();
        
        if (title) {
          results.push({
            title: title.substring(0, 500),
            content: null,
            imageUrl: null,
            localImagePath: null,
            articleUrl: url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
        }
      }
      
    } catch (error) {
      logger.error('Error crawling Jivh Hurgelt:', error);
    }
    
    return results;
  },
  
  async crawlBabyWorld($, url, maxPosts) {
    // Similar implementation
    return await this.crawlGenericWebsite($, url, maxPosts);
  },
  
  async crawlNomin($, url, maxPosts) {
    // Similar implementation  
    return await this.crawlGenericWebsite($, url, maxPosts);
  },
  
  async crawlGenericWebsite($, url, maxPosts) {
    const results = [];
    
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
      
      let items = null;
      
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
          let imageUrl = pageImage;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, url).href;
          }
          
          let localImagePath = null;
          if (imageUrl) {
            localImagePath = await imageService.downloadImage(imageUrl, 'website', 'generic_page');
          }
          
          results.push({
            title: pageTitle.trim(),
            content: null,
            imageUrl: imageUrl,
            localImagePath: localImagePath,
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
          let localImagePath = null;
          if (imageUrl) {
            localImagePath = await imageService.downloadImage(imageUrl, 'website', `generic_${i}`);
          }
          
          results.push({
            title: title.substring(0, 500),
            content: null,
            imageUrl: imageUrl,
            localImagePath: localImagePath,
            articleUrl: fullLink || url,
            publishedAt: new Date(),
            source: url,
            platform: 'website',
            crawledAt: new Date()
          });
        }
      }
      
    } catch (error) {
      logger.error('Error in generic website crawl:', error);
    }
    
    return results;
  }
};

module.exports = websiteCrawlerService;
