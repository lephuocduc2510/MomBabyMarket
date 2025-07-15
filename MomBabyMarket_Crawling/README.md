# MomBabyMarket Crawler

Professional web crawler tool for MomBabyMarket case study. Crawls data from Facebook pages, Instagram accounts, and e-commerce websites.

## 🚀 Features

- **Multi-platform support**: Facebook, Instagram, E-commerce websites
- **Docker containerized**: Professional deployment with Docker
- **Concurrent crawling**: Optimized performance with rate limiting
- **Image downloading**: Automatic image download and optimization
- **Comprehensive logging**: Winston-based logging system
- **Error handling**: Robust retry mechanisms and error recovery
- **Data export**: JSON output with structured data

## 📋 Prerequisites

- Node.js 18+ (if running locally)
- Docker & Docker Compose (recommended)
- 4GB+ RAM for browser instances

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended)

```bash
# Clone and navigate to project
cd MomBabyMarket_Crawling

# Build and run with Docker Compose
npm run docker:build
npm run docker:run

# Check logs
npm run docker:logs

# Stop containers
npm run docker:stop
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Create data directories
mkdir -p data/images logs

# Copy environment file
cp .env.example .env

# Run development mode
npm run dev

# Or build and run
npm run build
npm start
```

## ⚙️ Configuration

### Environment Variables

```env
# Crawler Settings
NODE_ENV=development
HEADLESS=true
CRAWL_BATCH_SIZE=5
CRAWL_DELAY=2000
MAX_RETRIES=3
TIMEOUT=30000

# Browser Settings
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080

# Output Settings
OUTPUT_DIR=./data
IMAGES_DIR=./data/images
JSON_OUTPUT=./data/crawled_data.json

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/crawler.log
```

### Crawl Targets

Edit `src/config/targets.ts` to modify crawl targets:

```typescript
export const crawlTargets: CrawlTarget[] = [
  {
    url: 'https://www.facebook.com/mamako.mgl/',
    platform: 'facebook',
    name: 'Mamako Mongolia',
    maxPosts: 5
  },
  // ... more targets
];
```

## 📊 Output Structure

```
data/
├── crawled_data.json          # Main results
├── crawl_stats.json           # Crawling statistics
├── summary_report.json        # Summary by platform/source
└── images/                    # Downloaded images
    ├── facebook/
    ├── instagram/
    └── website/
```

### Data Format

```json
{
  "title": "Post title or product name",
  "content": "Post content (optional)",
  "imageUrl": "Original image URL",
  "localImagePath": "data/images/facebook/image.jpg",
  "articleUrl": "https://facebook.com/post/123",
  "publishedAt": "2025-01-15T10:30:00.000Z",
  "source": "https://www.facebook.com/mamako.mgl/",
  "platform": "facebook",
  "crawledAt": "2025-01-15T12:00:00.000Z"
}
```

## 🎯 Supported Platforms

### Facebook Pages
- Extracts posts with titles, images, and links
- Handles dynamic content loading
- Automatic scrolling for more posts

### Instagram Accounts
- Crawls individual posts from profile
- Extracts captions and images
- Supports both posts and reels

### E-commerce Websites
- **emonos.mn**: Product listings and details
- **jivh-hurgelt.mn**: Category-based crawling
- **babyworld.mn**: Product information
- **nomin.mn**: Articles and products

## 🔧 Advanced Usage

### Custom Crawling

```bash
# Crawl specific number of posts
CRAWL_BATCH_SIZE=10 npm start

# Enable debug mode
LOG_LEVEL=debug npm run dev

# Run headful mode (show browser)
HEADLESS=false npm run dev
```

### Docker Commands

```bash
# Build custom image
docker build -t my-crawler .

# Run with custom settings
docker run -e HEADLESS=false -v $(pwd)/data:/app/data my-crawler

# Check container status
docker ps
docker logs mombabymarket-crawler
```

## 📈 Performance Optimization

- **Concurrency**: Limited to 2 concurrent crawlers
- **Request filtering**: Blocks CSS/fonts to speed up loading
- **Image optimization**: Auto-resize and compress images
- **Retry mechanism**: Exponential backoff for failed requests
- **Memory management**: Proper browser cleanup

## 🛡️ Error Handling

- **Network errors**: Automatic retry with exponential backoff
- **Selector changes**: Multiple fallback selectors
- **Rate limiting**: Built-in delays and request limiting
- **Memory leaks**: Proper resource cleanup
- **Graceful shutdown**: SIGINT/SIGTERM handling

## 📝 Logging

```bash
# View real-time logs
tail -f logs/crawler.log

# Filter by level
grep "ERROR" logs/crawler.log
grep "INFO" logs/crawler.log
```

## 🔍 Troubleshooting

### Common Issues

1. **Chrome crashes in Docker**
   ```bash
   # Add more memory to Docker
   docker run --shm-size=2g ...
   ```

2. **Selector not found**
   ```bash
   # Enable debug mode
   LOG_LEVEL=debug npm run dev
   ```

3. **Rate limiting**
   ```bash
   # Increase delays
   CRAWL_DELAY=5000 npm start
   ```

## 📊 Monitoring

### Health Checks
```bash
# Docker health check
docker ps --format "table {{.Names}}\t{{.Status}}"

# Manual health check
curl http://localhost:3000/health
```

### Performance Metrics
- Crawl duration and success rate
- Images downloaded and processed
- Error rates by platform
- Memory and CPU usage

## 🚀 Next Steps

After crawling:

1. **Review results**: Check `data/crawled_data.json`
2. **Validate images**: Verify downloaded images in `data/images/`
3. **Import to database**: Use data for MongoDB import (Part 2)
4. **API integration**: Connect to backend API (Part 3)

## 📄 License

MIT License - See LICENSE file for details.

---

**Hekate Team** - Building the future of AI-powered market intelligence
