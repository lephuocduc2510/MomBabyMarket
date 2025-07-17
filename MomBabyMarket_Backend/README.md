# MomBabyMarket Backend

Backend API đơn giản cho việc lưu trữ và quản lý dữ liệu sản phẩm được crawl từ các trang web.

## 🚀 Khởi động nhanh

**📝 Khởi tạo db tại MongoDb Compass:** 
- Database: `mombabymarket`
- Collection: `products` 
- Port: `9000`
- MongoDB URI: `mongodb://localhost:27017/mombabymarket`

### 1. Cài đặt
```bash
npm install
```


Server sẽ chạy tại: `http://localhost:9000`

## 📊 Import dữ liệu

### Import từ file JSON
```bash

- hãy thực hiện đưa file crawled_data.json từ thư mục MomBabyMarket_Crawling/data sang thư mục MomBabyMarket_Backend/data 

# Import dữ liệu (giữ lại data cũ)

npm run import ./data/crawled_data.json

# Xóa hết và import lại
npm run import:clear ./data/crawled_data.json

# Xem thống kê
npm run import:stats
```

### Ví dụ kết quả import
```
📄 Found 161 products in JSON file
🔍 Validating products...
✅ 161 valid products out of 161 total
📦 Processing batch 1/2 (100 products)...
📦 Processing batch 2/2 (61 products)...

📊 Import Summary:
✅ Successfully imported: 161 products
⚠️  Skipped (duplicates): 0 products
❌ Errors: 0 products
📁 Total in database: 161 products
```

## 🗃️ Kết nối và xem dữ liệu MongoDB

### Kết nối MongoDB CLI
```bash
# Mở MongoDB shell
mongosh

# Chọn database
use mombabymarket

# Xem collections
show collections
```

### Các lệnh xem dữ liệu cơ bản
```javascript
// Đếm tổng số sản phẩm
db.products.countDocuments()

// Xem 5 sản phẩm mới nhất
db.products.find().sort({ crawledAt: -1 }).limit(5)

// Xem sản phẩm từ Facebook
db.products.find({ platform: "facebook" }).limit(5)

// Xem sản phẩm từ website
db.products.find({ platform: "website" }).limit(5)

// Thống kê theo platform
db.products.aggregate([
  { $group: { _id: "$platform", count: { $sum: 1 } } }
])

// Tìm sản phẩm có title
db.products.find({ title: { $ne: "" } }).limit(5)
```

## 🔌 API Endpoints chính

```bash
# Kiểm tra server
curl http://localhost:9000/api/test

# Lấy tất cả sản phẩm (có phân trang)
curl "http://localhost:9000/api/products?page=1&limit=10"

# Lấy sản phẩm theo platform
curl "http://localhost:9000/api/products?platform=facebook"

# Tìm kiếm sản phẩm
curl "http://localhost:9000/api/products?search=mamako"

# Xem thống kê
curl http://localhost:9000/api/products/stats
```



### Test API
```bash
# Test cơ bản
curl http://localhost:9000/api/test

# Test với parameters
curl "http://localhost:9000/api/products?limit=5"
```

---

