# MomBabyMarket CrawlerTool crawl chuyên nghiệp cho dự án MomBabyMarket case study sử dụng JavaScript và Docker.## 🚀 Tính năng- **Multi-platform**: Facebook, Instagram, E-commerce websites- **Docker containerized**: Deploy chuyên nghiệp với Docker- **Service Pattern**: Kiến trúc module rõ ràng, dễ bảo trì- **Image downloading**: Tự động download và tối ưu ảnh- **Comprehensive logging**: Hệ thống log chi tiết- **Error handling**: Xử lý lỗi và retry mechanism## 📋 Yêu cầu- Node.js 18+ (nếu chạy local)- Docker & Docker Compose (khuyến nghị)- 4GB+ RAM cho browser instances## 🛠️ Cài đặt & Chạy### Option 1: Docker (Khuyến nghị)```bash# Navigate to projectcd MomBabyMarket_Crawling# Cài đặt dependenciesnpm install# Build và chạy với Dockernpm run docker:buildnpm run docker:run# Xem logsnpm run docker:logs# Dừng containersnpm run docker:stop```### Option 2: Local Development```bash# Cài đặt dependenciesnpm install# Tạo thư mục outputmkdir -p data/images logs# Chạy development modenpm run dev# Hoặc chạy productionnpm start```## ⚙️ Cấu hình### Environment Variables (.env)```env# Crawler SettingsNODE_ENV=developmentHEADLESS=trueCRAWL_DELAY=3000MAX_RETRIES=3TIMEOUT=30000# Browser SettingsUSER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)...VIEWPORT_WIDTH=1366VIEWPORT_HEIGHT=768# Output SettingsOUTPUT_DIR=./dataIMAGES_DIR=./data/images# LoggingLOG_LEVEL=info```### Targets ConfigurationFile `src/config/targets.js` chứa 32 targets:- 16 Facebook pages- 6 Instagram accounts  - 10 E-commerce websites## 📊 Cấu trúc Output```data/├── crawled_data.json          # Dữ liệu chính├── crawl_stats.json           # Thống kê crawl├── summary_report.json        # Báo cáo tổng hợp└── images/                    # Ảnh đã download    ├── facebook/    ├── instagram/    └── website/```### Format dữ liệu JSON```json{  "title": "Tiêu đề bài viết hoặc sản phẩm",  "content": "Nội dung bài viết (nếu có)",  "imageUrl": "URL ảnh gốc",  "localImagePath": "data/images/facebook/image.jpg",  "articleUrl": "https://facebook.com/post/123",  "publishedAt": "2025-01-15T10:30:00.000Z",  "source": "https://www.facebook.com/mamako.mgl/",  "platform": "facebook",  "crawledAt":# MomBabyMarket Crawler 🕷️

Tool crawl chuyên nghiệp cho dự án MomBabyMarket case study. Thu thập dữ liệu từ 32 targets: Facebook, Instagram và các website thương mại điện tử.

## 🚀 Tính năng

- ✅ **32 targets**: 16 Facebook + 6 Instagram + 10 websites  
- ✅ **Docker ready**: Containerized với Chrome headless
- ✅ **Service Pattern**: Kiến trúc modular, dễ bảo trì
- ✅ **Auto download**: Tải và tối ưu ảnh tự động
- ✅ **Error handling**: Retry mechanism + comprehensive logging

## 📋 Yêu cầu

- **Docker** (khuyến nghị) hoặc Node.js 18+
- **4GB+ RAM** cho browser instances
- **Internet connection** ổn định

## 🏃‍♂️ Cách chạy

### Option 1: Docker (Khuyến nghị)

```bash
# 1. Build image
docker build -t mombabymarket-crawler .

# 2. Chạy crawler
docker run mombabymarket-crawler
```

### Option 2: Docker với volume mapping

```bash
# Map data folder để lưu kết quả
docker run -v $(pwd)/data:/app/data mombabymarket-crawler

# Windows PowerShell:
docker run -v ${PWD}/data:/app/data mombabymarket-crawler

# Windows CMD:
docker run -v %cd%/data:/app/data mombabymarket-crawler
```

### Option 3: Local Development

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy crawler
npm start

# Debug mode
npm run dev
```

### Option 4: Docker Compose

```bash
# Build và chạy
docker-compose up --build

# Chạy background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

## 🔧 Debug & Troubleshooting

```bash
# Xem logs real-time
docker logs -f container_name

# Vào container để debug
docker run -it --entrypoint=/bin/sh mombabymarket-crawler

# Build lại từ đầu
docker build --no-cache -t mombabymarket-crawler .

# Chạy interactive mode
docker run -it mombabymarket-crawler
```

## 🎯 32 Targets

| Platform | Count | Examples |
|----------|-------|----------|
| Facebook | 16 | mamako.mgl, novomgl, pigeonmongolia... |
| Instagram | 6 | jivhkhurgelt, tushopping2, nominmn.official... |
| Websites | 10 | emonos.mn, jivh-hurgelt.mn, babyworld.mn... |

---

**Hekate Team** - Building AI-powered market intelligence 🚀"2025-01-15T12:00:00.000Z"}```## 🏗️ Kiến trúc Service Pattern```src/├── config/│   └── targets.js             # Cấu hình 32 targets├── services/│   ├── browserService.js      # Quản lý Puppeteer browser│   ├── imageService.js        # Download & optimize images│   ├── facebookCrawlerService.js│   ├── instagramCrawlerService.js│   ├── websiteCrawlerService.js│   ├── fileService.js         # Save results to files│   └── crawlerService.js      # Main orchestrator├── utils/│   └── logger.js              # Winston logging└── index.js                   # Entry point```## 🎯 Platforms được hỗ trợ### Facebook Pages- Extract posts với titles, images, links- Dynamic content loading- Automatic scrolling### Instagram Accounts  - Crawl individual posts từ profile- Extract captions và images- Support posts và reels### E-commerce Websites- **emonos.mn**: Product listings- **jivh-hurgelt.mn**: Category-based crawling- **babyworld.mn**: Product information- **nomin.mn**: Articles và products## 🔧 Advanced Usage### Custom Settings```bash# Crawl với headful mode (show browser)HEADLESS=false npm run dev# Tăng delay giữa requestsCRAWL_DELAY=5000 npm start# Debug modeLOG_LEVEL=debug npm run dev```### Docker Commands```bash# Build custom imagedocker build -t my-crawler .# Run với custom settingsdocker run -e HEADLESS=false -v $(pwd)/data:/app/data my-crawler# Check logsdocker logs mombabymarket-crawler```## 📈 Performance & Monitoring- **Error handling**: Automatic retry với exponential backoff- **Rate limiting**: Built-in delays giữa requests- **Memory management**: Proper browser cleanup- **Resource optimization**: Block CSS/fonts để tăng tốc## 🚀 Chạy Crawler```bash# Development modenpm run dev# Production mode  npm start# Docker modenpm run docker:run```## 📝 Output FilesSau khi chạy, check các files:1. **`data/crawled_data.json`** - Dữ liệu chính để import vào MongoDB2. **`data/images/`** - Ảnh đã download theo platform3. **`data/crawl_stats.json`** - Thống kê performance4. **`logs/crawler.log`** - Log files chi tiết## 🔄 Workflow tiếp theo1. **Review results**: Check `data/crawled_data.json`2. **Validate images**: Verify ảnh trong `data/images/`3. **Import to MongoDB**: Sử dụng data cho Phần 24. **API integration**: Connect tới backend (Phần 3)## 📄 LicenseMIT License---**Hekate Team** - Building the future of AI-powered market intelligence