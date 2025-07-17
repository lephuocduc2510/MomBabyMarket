const browserService = require('./browserService');
const imageService = require('./imageService');
const fileService = require('./fileService');
const logger = require('../utils/logger');

const facebookCrawlerService = {
  async crawl(url, maxPosts = 5, name) {
    const results = [];
    let page = null;

    try {
      logger.info(`Starting Facebook crawl for: ${url}`);

      page = await browserService.createPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      const posts = await page.evaluate(() => {
        const postElements = Array.from(document.querySelectorAll('[role="article"]'));
        return postElements.map((post) => {
          const title = post.querySelector('[data-ad-preview="message"]')?.textContent || '';
          const imageUrl = post.querySelector('img[src*="scontent"]')?.src || '';
          const articleUrl = post.querySelector('a[href*="/posts/"]')?.href || '';
          return { title, imageUrl, articleUrl };
        });
      });

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];

        // ✅ Chỉ xử lý post có cả title và imageUrl
        if (!post.title || !post.imageUrl || post.title.trim() === '') {
          logger.info(`⏭️ Skipping post ${i + 1}: Missing title or image`);
          continue;
        }

        let localImagePath = null;

        if (post.imageUrl) {
          localImagePath = await imageService.downloadImage(
            post.imageUrl,
            'facebook',
            name,
            `post_${i + 1}`
          );
        }

        const result = {
          ...post,
          localImagePath,
          source: url,
          platform: 'facebook',
          crawledAt: new Date(),
        };

        results.push(result);

        // Append result to JSON file
        await fileService.appendResult(result);

        logger.info(`✅ Post ${i + 1} processed successfully:`);
        logger.info(`   📝 Title: "${result.title.substring(0, 80)}..."`);
        logger.info(`   🖼️  Image: ${result.imageUrl ? 'Available' : 'None'}`);
        logger.info(`   🔗 Link: ${result.articleUrl ? 'Available' : 'None'}`);
      }

      logger.info(`🎉 Facebook crawl completed successfully!`);
    } catch (error) {
      logger.error(`❌ Facebook crawl failed for ${url}:`, error.message);
    } finally {
      if (page) await browserService.closePage(page);
    }

    return results;
  },
};

module.exports = facebookCrawlerService;