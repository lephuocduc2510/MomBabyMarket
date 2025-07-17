# MomBabyMarket Crawler 🕷️

Tool crawl chuyên nghiệp cho dự án MomBabyMarket case study. Thu thập dữ liệu từ 32 targets: Facebook, Instagram và các website thương mại điện tử.

## 📋 Yêu cầu

- **Docker** (khuyến nghị) hoặc Node.js 18+
- **4GB+ RAM** cho browser instances
- **Internet connection** ổn định

## 🏃‍♂️ Cách chạy

### Option 1: Docker Compose

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


### Option 2: Local Development

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy dự án và bắt đầu crawler
npm run dev


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