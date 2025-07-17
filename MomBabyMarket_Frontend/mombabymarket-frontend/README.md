# Mom Baby Market

Dự án Mom Baby Market - Platform theo dõi và phân tích sản phẩm mẹ và bé từ các mạng xã hội và website thương mại điện tử.

## Cài đặt và Chạy

### Frontend (Next.js)

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
npm start
```

### Backend (API Server)

```bash
# Di chuyển đến thư mục backend
cd ../MomBabyMarket_Backend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Hoặc chạy production
npm start
```

## Biến Môi Trường

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:9000
```

### Backend (.env)

```env
PORT=9000
MONGODB_URI=mongodb://localhost:27017/mombabymarket
# hoặc MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mombabymarket

# Các biến môi trường khác (nếu có)
NODE_ENV=development
```

## Truy cập

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:9000](http://localhost:9000)
- **Health Check**: [http://localhost:9000/health](http://localhost:9000/health)

## Chức năng chính

- Hiển thị tất cả sản phẩm với phân trang
- Tìm kiếm và lọc sản phẩm theo platform (Facebook, Instagram, Website)
- Theo dõi trạng thái kết nối API
- Responsive design với Tailwind CSS
