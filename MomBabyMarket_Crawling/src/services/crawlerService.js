const facebookCrawlerService = require('./facebookCrawlerService');
const instagramCrawlerService = require('./instagramCrawlerService');
const websiteCrawlerService = require('./websiteCrawlerService');
const browserService = require('./browserService');
const fileService = require('./fileService');
const logger = require('../utils/logger');

const crawlerService = {
  async crawlAll(targets) {
    const stats = {
      totalTargets: targets.length,
      successfulTargets: 0,
      failedTargets: 0,
      totalPosts: 0,
      totalImages: 0,
      startTime: new Date()
    };
    
    const allResults = [];
    
    try {
      logger.info(`🚀 Starting crawl for ${targets.length} targets`);
      
      // Initialize browser
      await browserService.initialize();
      
      // Process each target
      for (const target of targets) {
        try {
          logger.info(`📍 Processing: ${target.name} (${target.platform})`);
          
          let results = [];
          
          switch (target.platform) {
            case 'facebook':
              results = await facebookCrawlerService.crawl(target.url, target.maxPosts);
              break;
            case 'instagram':
              results = await instagramCrawlerService.crawl(target.url, target.maxPosts);
              break;
            case 'website':
              results = await websiteCrawlerService.crawl(target.url, target.maxPosts);
              break;
            default:
              logger.warn(`Unknown platform: ${target.platform}`);
              continue;
          }
          
          if (results.length > 0) {
            allResults.push(...results);
            stats.successfulTargets++;
            stats.totalPosts += results.length;
            stats.totalImages += results.filter(r => r.localImagePath).length;
            logger.info(`✅ ${target.name}: ${results.length} posts extracted`);
          } else {
            stats.failedTargets++;
            logger.warn(`❌ ${target.name}: No posts extracted`);
          }
          
          // Add delay between targets to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, parseInt(process.env.CRAWL_DELAY) || 2000));
          
        } catch (error) {
          logger.error(`❌ Failed to crawl ${target.name}: ${error.message}`);
          stats.failedTargets++;
        }
      }
      
      // Calculate final stats
      stats.endTime = new Date();
      stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
      
      // Save all results
      await fileService.saveResults(allResults);
      await fileService.saveStats(stats);
      await fileService.saveSummaryReport(allResults, stats);
      
      logger.info('🎉 Crawling completed successfully!');
      
    } catch (error) {
      logger.error('❌ Crawler service failed:', error);
      throw error;
    } finally {
      await browserService.close();
    }
    
    return { results: allResults, stats };
  }
};

module.exports = crawlerService;
