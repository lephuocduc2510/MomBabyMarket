# 🚀 Instagram Basic Display API Setup Guide

## Bước 1: Tạo Facebook App
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Chọn "Consumer" → Click "Next"
4. Nhập tên app và email → Click "Create App"

## Bước 2: Thêm Instagram Basic Display Product
1. Trong dashboard của app, click "Add Product"
2. Tìm "Instagram Basic Display" → Click "Set Up"
3. Click "Create New App" nếu được yêu cầu

## Bước 3: Configure Instagram Basic Display
1. Trong "Instagram Basic Display" → "Basic Display"
2. Click "Create New App"
3. Điền thông tin:
   - Display Name: Tên hiển thị của app
   - Valid OAuth Redirect URIs: `https://localhost/`
   - Deauthorize Callback URL: `https://localhost/`
   - Data Deletion Request URL: `https://localhost/`
4. Click "Save Changes"

## Bước 4: Add Instagram Tester
1. Trong "Instagram Basic Display" → "Roles" → "Roles"
2. Click "Add Instagram Testers"
3. Nhập Instagram username mà bạn muốn test
4. Người dùng sẽ nhận được invite, cần accept để test

## Bước 5: Generate Access Token
1. Trong "Instagram Basic Display" → "Basic Display"
2. Scroll xuống "User Token Generator"
3. Click "Generate Token" bên cạnh Instagram account
4. Authorize app trên Instagram
5. Copy access token được tạo

## Bước 6: Cấu hình .env file
```env
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token_here
```

## Bước 7: Test API
```bash
npm run test-instagram
```

## 📊 Các fields có thể lấy từ API:
- `id`: Media ID
- `caption`: Caption của post
- `media_type`: IMAGE, VIDEO, CAROUSEL_ALBUM  
- `media_url`: URL của ảnh/video
- `permalink`: Link Instagram của post
- `timestamp`: Thời gian đăng
- `thumbnail_url`: Thumbnail cho video
- `children`: Cho carousel albums

## ⚡ Ưu điểm của Instagram API:
- ✅ Hoàn toàn hợp pháp và được Instagram hỗ trợ
- ✅ Không bị rate limit nghiêm ngặt như crawling
- ✅ Không rủi ro bị block tài khoản
- ✅ Dữ liệu chính xác và đầy đủ
- ✅ Hỗ trợ carousel albums (nhiều ảnh)
- ✅ Metadata đầy đủ (thời gian, loại media, etc.)

## 🔄 Long-lived Access Token:
Access token mặc định chỉ tồn tại 1 giờ. Để get long-lived token (60 ngày):

```bash
curl -i -X GET "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={your-access-token}"
```

## 📚 Tài liệu tham khảo:
- [Instagram Basic Display API Docs](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Getting Started Guide](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started)
