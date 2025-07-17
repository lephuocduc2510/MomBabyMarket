const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

const fileService = {
  async appendResult(result) {
    try {
      const outputDir = process.env.OUTPUT_DIR || './data';
      const outputFile = path.join(outputDir, 'crawled_data.json');

      // Ensure output directory exists
      await fs.ensureDir(outputDir);

      // Check if file exists and read existing data
      let existingData = [];
      let nextId = 1;

      if (await fs.pathExists(outputFile)) {
        existingData = await fs.readJson(outputFile);
        
        // Calculate next ID based on existing data
        if (existingData.length > 0) {
          const maxId = Math.max(...existingData.map(item => item.id || 0));
          nextId = maxId + 1;
        }
      }

      // Add ID to the new result
      const resultWithId = {
        id: nextId,
        ...result
      };

      // Append to existing data
      existingData.push(resultWithId);

      // Write back to file
      await fs.writeJson(outputFile, existingData, { spaces: 2 });

      logger.info(`💾 Result appended to: ${outputFile} (ID: ${nextId})`);
      return outputFile;
    } catch (error) {
      logger.error('Failed to append result:', error);
      throw error;
    }
  },

  async createImageDirectory(platform, name) {
    try {
      // Normalize name to remove special characters and spaces
      const normalizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
      const dir = path.join(process.cwd(), 'data', 'images', platform, normalizedName);

      // Ensure directory exists
      await fs.ensureDir(dir);
      logger.info(`📁 Image directory created: ${dir}`);
      return dir;
    } catch (error) {
      logger.error('Failed to create image directory:', error.message);
      throw error;
    }
  },

  // Helper function to get next available ID (optional, for manual use)
  async getNextId() {
    try {
      const outputDir = process.env.OUTPUT_DIR || './data';
      const outputFile = path.join(outputDir, 'crawled_data.json');

      if (await fs.pathExists(outputFile)) {
        const existingData = await fs.readJson(outputFile);
        if (existingData.length > 0) {
          const maxId = Math.max(...existingData.map(item => item.id || 0));
          return maxId + 1;
        }
      }
      return 1;
    } catch (error) {
      logger.error('Failed to get next ID:', error);
      return 1;
    }
  },

  // Helper function to reset IDs (nếu cần reset lại từ đầu)
  async resetIds() {
    try {
      const outputDir = process.env.OUTPUT_DIR || './data';
      const outputFile = path.join(outputDir, 'crawled_data.json');

      if (await fs.pathExists(outputFile)) {
        const existingData = await fs.readJson(outputFile);
        
        // Re-assign IDs from 1
        const dataWithNewIds = existingData.map((item, index) => ({
          id: index + 1,
          ...item
        }));

        await fs.writeJson(outputFile, dataWithNewIds, { spaces: 2 });
        logger.info(`🔄 IDs reset successfully. Total records: ${dataWithNewIds.length}`);
        return dataWithNewIds.length;
      }
      return 0;
    } catch (error) {
      logger.error('Failed to reset IDs:', error);
      throw error;
    }
  },
};

module.exports = fileService;