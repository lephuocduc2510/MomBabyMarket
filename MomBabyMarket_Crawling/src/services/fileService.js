const fs = require('fs-extra');
const path = require('path');
const logger = require('../utils/logger');

const fileService = {
  async saveResults(results) {
    try {
      const outputDir = process.env.OUTPUT_DIR || './data';
      const outputFile = path.join(outputDir, 'crawled_data.json');
      
      // Ensure output directory exists
      await fs.ensureDir(outputDir);
      
      // Save main results
      await fs.writeJson(outputFile, results, { spaces: 2 });
      logger.info(`💾 Results saved to: ${outputFile}`);
      
      return outputFile;
    } catch (error) {
      logger.error('Failed to save results:', error);
      throw error;
    }
  },

  async saveStats(stats) {
    try {
      const outputDir = process.env.OUTPUT_DIR || './data';
      const statsFile = path.join(outputDir, 'crawl_stats.json');
      
      await fs.writeJson(statsFile, stats, { spaces: 2 });
      logger.info(`📊 Stats saved to: ${statsFile}`);
      
      return statsFile;
    } catch (error) {
      logger.error('Failed to save stats:', error);
    }
  },

  async saveSummaryReport(results, stats) {
    try {
      const report = {
        summary: stats,
        byPlatform: {
          facebook: results.filter(r => r.platform === 'facebook').length,
          instagram: results.filter(r => r.platform === 'instagram').length,
          website: results.filter(r => r.platform === 'website').length
        },
        bySource: {}
      };

      // Count by source
      for (const result of results) {
        try {
          const domain = new URL(result.source).hostname;
          report.bySource[domain] = (report.bySource[domain] || 0) + 1;
        } catch (error) {
          // Skip invalid URLs
        }
      }

      const outputDir = process.env.OUTPUT_DIR || './data';
      const reportFile = path.join(outputDir, 'summary_report.json');
      
      await fs.writeJson(reportFile, report, { spaces: 2 });
      logger.info(`📋 Summary report saved to: ${reportFile}`);
      
      return reportFile;
    } catch (error) {
      logger.error('Failed to save summary report:', error);
    }
  }
};

module.exports = fileService;
