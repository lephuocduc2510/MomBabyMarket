/**
 * Instagram API Test Script
 * Kiểm tra Instagram Basic Display API setup
 */

require('dotenv').config();
const instagramApiService = require('./src/services/instagramApiService');
const logger = require('./src/utils/logger');

async function testInstagramApi() {
  try {
    logger.info('🧪 Testing Instagram API...');

    // 1. Validate access token
    const isValidToken = await instagramApiService.validateToken();
    
    if (!isValidToken) {
      logger.error('❌ Invalid access token. Please check your .env file.');
      logger.info('📋 Follow these steps to get your access token:');
      logger.info('1. Go to https://developers.facebook.com/');
      logger.info('2. Create a new app');
      logger.info('3. Add "Instagram Basic Display" product');
      logger.info('4. Configure Instagram Basic Display');
      logger.info('5. Generate User Token');
      logger.info('6. Add token to .env file as INSTAGRAM_ACCESS_TOKEN');
      return;
    }

    // 2. Get current user info
    const userInfo = await instagramApiService.getUserInfo('me');
    if (userInfo) {
      logger.info(`✅ Connected to Instagram account: ${userInfo.username}`);
      logger.info(`📊 Media count: ${userInfo.media_count}`);
    }

    // 3. Test crawling your own media
    logger.info('🚀 Testing media crawl...');
    const results = await instagramApiService.crawl('me', 3, 'Test User');
    
    logger.info(`🎉 Test completed successfully!`);
    logger.info(`📊 Retrieved ${results.length} media items`);
    
    if (results.length > 0) {
      logger.info('📋 Sample result:');
      const sample = results[0];
      logger.info(`   - Title: ${sample.title.substring(0, 50)}...`);
      logger.info(`   - Media Type: ${sample.mediaType}`);
      logger.info(`   - Published: ${sample.publishedAt}`);
      logger.info(`   - Local Image: ${sample.localImagePath ? 'Downloaded' : 'None'}`);
    }

  } catch (error) {
    logger.error('❌ Instagram API test failed:', error.message);
    
    if (error.response) {
      logger.error('Response data:', error.response.data);
      logger.error('Response status:', error.response.status);
    }
  }
}

// Run test
testInstagramApi();
