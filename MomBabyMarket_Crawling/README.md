# MomBabyMarket Crawler 🕷️

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

**Hekate Team** - Building AI-powered market intelligence 🚀