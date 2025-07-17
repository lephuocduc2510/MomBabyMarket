const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const logger = require('../utils/logger');
const fileService = require('./fileService');

const imageService = {
  async downloadImage(imageUrl, platform, name, filename) {
    try {
      // Create image directory based on platform and name
      const dir = await fileService.createImageDirectory(platform, name);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = '.jpg';
      const filePath = path.join(dir, `${timestamp}_${filename}${ext}`);

      // Download image
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      // Save to temp file first
      const tempPath = filePath + '.temp';
      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Optimize image with Sharp
      await sharp(tempPath)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      // Remove temp file
      await fs.remove(tempPath);

      // Return relative path
      const relativePath = path.relative(process.cwd(), filePath);
      logger.info(`Image downloaded: ${relativePath}`);
      return relativePath;
    } catch (error) {
      logger.error(`Failed to download image ${imageUrl}:`, error.message);
      return null;
    }
  },
};

module.exports = imageService;