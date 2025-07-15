import puppeteer, { Browser, Page } from 'puppeteer';
import { CrawlResult, CrawlerConfig } from '../types';
import { Logger } from '../utils/logger';
import { delay } from '../utils/helpers';

export abstract class BaseCrawler {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected logger = Logger.getInstance();
  
  constructor(protected config: CrawlerConfig) {}

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
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

      this.page = await this.browser.newPage();
      
      await this.page.setUserAgent(this.config.userAgent);
      await this.page.setViewport(this.config.viewport);

      // Set request interception to block unnecessary resources
      await this.page.setRequestInterception(true);
      this.page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'stylesheet' || resourceType === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });

      this.logger.info('Crawler initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize crawler', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) await this.page.close();
      if (this.browser) await this.browser.close();
      this.logger.info('Crawler cleanup completed');
    } catch (error) {
      this.logger.error('Cleanup failed', error);
    }
  }

  protected async navigateWithRetry(url: string, retries = 0): Promise<void> {
    try {
      if (!this.page) throw new Error('Page not initialized');
      
      this.logger.info(`Navigating to: ${url}`);
      
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });
      
      await delay(this.config.delay);
    } catch (error) {
      if (retries < this.config.maxRetries) {
        this.logger.warn(`Retrying navigation to ${url}, attempt ${retries + 1}`);
        await delay(2000 * (retries + 1)); // Exponential backoff
        return this.navigateWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  protected async waitForSelector(selector: string, timeout = 10000): Promise<boolean> {
    try {
      if (!this.page) return false;
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      this.logger.warn(`Selector not found: ${selector}`);
      return false;
    }
  }

  abstract crawl(url: string, maxPosts: number): Promise<CrawlResult[]>;
}
