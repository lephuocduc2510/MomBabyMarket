# 🍼 MomBabyMarket - Hướng dẫn chạy ứng dụng

Ứng dụng web để crawl và hiển thị dữ liệu sản phẩm mẹ và bé từ các trang mạng xã hội.

## � Hướng dẫn chạy nhanh

### Bước 1: Crawl dữ liệu
```bash
# Truy cập thư mục crawler
cd MomBabyMarket_Crawling

# Cài đặt dependencies
npm install

# Chạy lệnh crawl (xem thêm trong README của thư mục này)
npm run dev hoặc docker-compose up --build

# Dữ liệu sẽ được lưu vào file data/crawled_data.json
```

### Bước 2: Setup Backend
```bash
# Truy cập thư mục backend (xem thêm trong README của thư mục này)
cd ../MomBabyMarket_Backend 

# Cài đặt dependencies
npm install

# Khởi động MongoDB (nếu chưa chạy)
mongod

# Import dữ liệu từ crawler
npm run import:clear ./data/crawled_data.json

# Chạy backend server
npm run dev
```

### Bước 3: Setup Frontend
```bash
# Truy cập thư mục frontend  
cd ../MomBabyMarket_Frontend/mombabymarket-frontend

# Cài đặt dependencies
npm install

# Chạy frontend
npm run dev:frontend hoặc npm run dev (nếu chưa chạy backend)
```

### Bước 4: Truy cập ứng dụng
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:9000
- **MongoDB**: mongodb://localhost:27017/mombabymarket

## � Yêu cầu hệ thống

- **Node.js** (v18 trở lên)
- **MongoDB** (local hoặc MongoDB Atlas)
- **Git**

```

## � Links hữu ích

- Frontend: http://localhost:3001
- Backend API: http://localhost:9000/api/products
- Health check: http://localhost:9000/health

---

**Lưu ý**: Đảm bảo MongoDB đang chạy trước khi start backend!

