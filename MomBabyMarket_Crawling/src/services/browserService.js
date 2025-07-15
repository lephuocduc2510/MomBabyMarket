const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

let browser = null;

const browserService = {
  async initialize() {
    if (browser) return browser;
    
    try {
      browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      logger.info('Browser initialized successfully');
      return browser;
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  },

  async createPage() {
    if (!browser) {
      await this.initialize();
    }
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent(
      process.env.USER_AGENT || 
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Set viewport
    await page.setViewport({
      width: parseInt(process.env.VIEWPORT_WIDTH) || 1366,
      height: parseInt(process.env.VIEWPORT_HEIGHT) || 768
    });
    
    // Block unnecessary resources to speed up
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'stylesheet' || resourceType === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    return page;
  },

  async closePage(page) {
    try {
      if (page && !page.isClosed()) {
        await page.close();
      }
    } catch (error) {
      logger.warn('Error closing page:', error);
    }
  },

  async close() {
    try {
      if (browser) {
        await browser.close();
        browser = null;
        logger.info('Browser closed');
      }
    } catch (error) {
      logger.error('Error closing browser:', error);
    }
  }
};

module.exports = browserService;
