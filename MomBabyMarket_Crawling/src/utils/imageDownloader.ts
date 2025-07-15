import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { sanitizeFileName, getCurrentTimestamp } from './helpers';

export class ImageDownloader {
  private static outputDir = process.env.IMAGES_DIR || './data/images';

  static async downloadImage(imageUrl: string, platform: string, postId?: string): Promise<string | null> {
    try {
      // Ensure output directory exists
      await fs.ensureDir(this.outputDir);

      // Generate filename
      const timestamp = getCurrentTimestamp();
      const platformDir = path.join(this.outputDir, platform);
      await fs.ensureDir(platformDir);

      const filename = `${timestamp}_${sanitizeFileName(postId || 'image')}.jpg`;
      const filePath = path.join(platformDir, filename);

      // Download image
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Save original image
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
      return path.relative(process.cwd(), filePath);

    } catch (error) {
      console.error(`Failed to download image ${imageUrl}:`, error);
      return null;
    }
  }
}
