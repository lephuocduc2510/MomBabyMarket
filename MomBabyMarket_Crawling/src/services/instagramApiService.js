const axios = require('axios');
const logger = require('../utils/logger');
const fileService = require('./fileService');
const imageService = require('./imageService');
require('dotenv').config();

/**
 * Instagram Basic Display API Service
 * Sử dụng Instagram Official API để crawl dữ liệu một cách hợp pháp
 */
class InstagramApiService {
  constructor() {
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.baseUrl = 'https://graph.instagram.com';
    
    if (!this.accessToken) {
      logger.warn('⚠️  Instagram Access Token not found in environment variables');
      logger.info('📋 Please follow these steps to get your access token:');
      logger.info('1. Go to https://developers.facebook.com/');
      logger.info('2. Create a new app');
      logger.info('3. Add Instagram Basic Display product');
      logger.info('4. Generate access token');
      logger.info('5. Add INSTAGRAM_ACCESS_TOKEN to your .env file');
    }
  }

  /**
   * Crawl Instagram media using official API
   */
  async crawl(instagramUserId, maxPosts = 5, name) {
    const results = [];

    try {
      if (!this.accessToken) {
        logger.error('❌ Instagram Access Token is required');
        return results;
      }

      logger.info(`🚀 Starting Instagram API crawl for user: ${instagramUserId}`);

      // Get user's media
      const mediaResponse = await this.getUserMedia(instagramUserId, maxPosts);
      
      if (!mediaResponse || !mediaResponse.data) {
        logger.warn('No media found for this user');
        return results;
      }

      logger.info(`📊 Found ${mediaResponse.data.length} media items`);

      // Process each media item
      for (let i = 0; i < mediaResponse.data.length; i++) {
        const media = mediaResponse.data[i];
        
        try {
          const processedMedia = await this.processMediaItem(media, i, name);
          
          if (processedMedia) {
            results.push(processedMedia);
            await fileService.appendResult(processedMedia);

            logger.info(`✅ Instagram Media ${i + 1} processed successfully:`);
            logger.info(`   📝 Caption: "${(processedMedia.title || '').substring(0, 80)}..."`);
            logger.info(`   🖼️  Image: ${processedMedia.imageUrl ? 'Available' : 'None'}`);
            logger.info(`   💾 Local Image: ${processedMedia.localImagePath ? 'Saved' : 'None'}`);
          }
        } catch (error) {
          logger.warn(`❌ Failed to process media ${media.id}:`, error.message);
        }
      }

      logger.info(`🎉 Instagram API crawl completed: ${results.length} media items extracted`);

    } catch (error) {
      logger.error(`❌ Instagram API crawl failed:`, error.message);
      
      if (error.response && error.response.status === 401) {
        logger.error('🔑 Access token is invalid or expired. Please refresh your token.');
      }
    }

    return results;
  }

  /**
   * Get user's media from Instagram API
   */
  async getUserMedia(userId, limit = 5) {
    try {
      const url = `${this.baseUrl}/${userId}/media`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url',
          access_token: this.accessToken,
          limit: limit
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user media:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific media
   */
  async getMediaDetails(mediaId) {
    try {
      const url = `${this.baseUrl}/${mediaId}`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,children',
          access_token: this.accessToken
        }
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch media details for ${mediaId}:`, error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Process a single media item
   */
  async processMediaItem(media, index, name) {
    try {
      logger.info(`📸 Processing Instagram media ${index + 1}: ${media.id}`);

      // Get detailed media information
      const detailedMedia = await this.getMediaDetails(media.id);
      const finalMedia = detailedMedia || media;

      // Extract basic information
      const title = finalMedia.caption || `Instagram Post ${index + 1}`;
      const imageUrl = finalMedia.media_url || finalMedia.thumbnail_url;
      const permalink = finalMedia.permalink;
      const publishedAt = new Date(finalMedia.timestamp);
      const mediaType = finalMedia.media_type; // IMAGE, VIDEO, CAROUSEL_ALBUM

      // Download image if available
      let localImagePath = null;
      if (imageUrl) {
        logger.info(`📥 Downloading Instagram image for post ${index + 1}...`);
        try {
          localImagePath = await imageService.downloadImage(
            imageUrl,
            'instagram',
            name,
            `api_post_${index + 1}`
          );
          
          if (localImagePath) {
            logger.info(`✅ Image downloaded successfully: ${localImagePath}`);
          }
        } catch (imageError) {
          logger.error(`❌ Image download error for post ${index + 1}:`, imageError.message);
        }
      }

      // Handle carousel albums (multiple images)
      let additionalImages = [];
      if (mediaType === 'CAROUSEL_ALBUM' && finalMedia.children) {
        logger.info(`🖼️  Processing carousel album with ${finalMedia.children.data.length} items`);
        
        for (let j = 0; j < Math.min(finalMedia.children.data.length, 3); j++) { // Limit to 3 images
          const child = finalMedia.children.data[j];
          try {
            const childDetails = await this.getMediaDetails(child.id);
            if (childDetails && childDetails.media_url) {
              const childImagePath = await imageService.downloadImage(
                childDetails.media_url,
                'instagram',
                name,
                `api_post_${index + 1}_img_${j + 1}`
              );
              if (childImagePath) {
                additionalImages.push(childImagePath);
              }
            }
          } catch (error) {
            logger.warn(`Failed to download carousel image ${j + 1}:`, error.message);
          }
        }
      }

      return {
        id: finalMedia.id,
        title: title.substring(0, 500),
        content: finalMedia.caption || null,
        imageUrl: imageUrl,
        localImagePath: localImagePath,
        additionalImages: additionalImages,
        articleUrl: permalink,
        publishedAt: publishedAt,
        mediaType: mediaType,
        source: `Instagram User ${name}`,
        platform: 'instagram_api',
        crawledAt: new Date(),
      };

    } catch (error) {
      logger.error(`Failed to process Instagram media item:`, error);
      return null;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(userId) {
    try {
      const url = `${this.baseUrl}/${userId}`;
      
      const response = await axios.get(url, {
        params: {
          fields: 'id,username,media_count',
          access_token: this.accessToken
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch user info:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Check if access token is valid
   */
  async validateToken() {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username',
          access_token: this.accessToken
        }
      });

      logger.info(`✅ Instagram API token is valid for user: ${response.data.username}`);
      return true;
    } catch (error) {
      logger.error('❌ Instagram API token validation failed:', error.response?.data || error.message);
      return false;
    }
  }
}

module.exports = new InstagramApiService();
