const facebookCrawlerService = require('./facebookCrawlerService');
const instagramCrawlerService = require('./instagramCrawlerService');
const instagramApiService = require('./instagramApiService');
const websiteCrawlerService = require('./websiteCrawlerService');
const logger = require('../utils/logger'); // Import logger

const crawlerService = {
  async crawlAll(targets) {
    const stats = {
      totalTargets: targets.length,
      successfulTargets: 0,
      totalPosts: 0,
      totalImages: 0,
      startTime: Date.now() 
    };

    for (const target of targets) {
      try {
        logger.info(`Starting crawl for: ${target.name} (${target.platform})`);

        let results = [];
        switch (target.platform) {
          case 'facebook':
            results = await facebookCrawlerService.crawl(target.url, target.maxPosts, target.name);
            break;
          case 'instagram':
            results = await instagramCrawlerService.crawl(target.url, target.maxPosts, target.name);
            break;
          case 'instagram_api':
            // Use Instagram Official API
            results = await instagramApiService.crawl(target.userId || target.url, target.maxPosts, target.name);
            break;
          case 'website':
            results = await websiteCrawlerService.crawl(target.url, target.maxPosts, target.name);
            break;
          default:
            logger.warn(`Unknown platform: ${target.platform}`);
        }

        // Update stats
        stats.successfulTargets++;
        stats.totalPosts += results.length;
        stats.totalImages += results.filter((r) => r.localImagePath).length;

        logger.info(`✅ Successfully crawled: ${target.name}`);
      } catch (error) {
        logger.error(`❌ Failed to crawl ${target.name}:`, error.message);
      }
    }

    stats.duration = Date.now() - stats.startTime;
    return { stats };
  },
};

module.exports = crawlerService;