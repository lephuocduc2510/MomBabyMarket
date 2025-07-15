require('dotenv').config();
const crawlerService = require('./services/crawlerService');
const { targets } = require('./config/targets');
const logger = require('./utils/logger');

// Ensure directories exist
const fs = require('fs-extra');
async function setupDirectories() {
  const dirs = [
    './data',
    './data/images',
    './data/images/facebook',
    './data/images/instagram', 
    './data/images/website',
    './logs'
  ];

  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
}

async function main() {
  try {
    logger.info('🚀 MomBabyMarket Crawler Starting...');
    logger.info(`📊 Total targets: ${targets.length}`);
    
    // Setup output directories
    await setupDirectories();
    
    // Start crawling
    const { results, stats } = await crawlerService.crawlAll(targets);
    
    // Print summary
    const duration = stats.duration ? Math.round(stats.duration / 1000) : 0;
    
    console.log('\n🎉 Crawling Complete!');
    console.log('====================');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🎯 Targets: ${stats.successfulTargets}/${stats.totalTargets} successful`);
    console.log(`📄 Posts: ${stats.totalPosts} extracted`);
    console.log(`🖼️  Images: ${stats.totalImages} downloaded`);
    console.log(`📁 Output: ./data/crawled_data.json`);
    console.log('====================\n');
    
    process.exit(0);
    
  } catch (error) {
    logger.error('❌ Crawler failed:', error);
    console.error('❌ Crawler failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the crawler
main();
