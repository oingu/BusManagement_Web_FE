# 🗺️ Hướng Dẫn Setup Routing API

## ⚠️ Vấn đề: Tuyến đường không đúng với đường xá thật

Nếu bạn thấy tuyến đường vẽ không chính xác, có 3 nguyên nhân:

1. **Đang dùng mock data** → Chỉ là dữ liệu giả lập
2. **OSRM public server không ổn định** → Chất lượng trung bình
3. **Cần API tốt hơn** → Dùng Mapbox hoặc OpenRouteService

## ✅ Giải pháp: Dùng API chất lượng cao

### So sánh các API

| API | Chất lượng | Chi phí | API Key | Free Tier | Giống Google Maps |
|-----|-----------|---------|---------|-----------|-------------------|
| **OSRM** | ⭐⭐⭐ | Miễn phí | ❌ Không | Unlimited | 60% |
| **Mapbox** | ⭐⭐⭐⭐⭐ | Freemium | ✅ Có | 100k/tháng | 95% |
| **OpenRouteService** | ⭐⭐⭐⭐ | Freemium | ✅ Có | 2k/ngày | 85% |
| **Google Maps** | ⭐⭐⭐⭐⭐ | Trả phí | ✅ Có | $200 credit | 100% |

### 🏆 Khuyến nghị: Dùng Mapbox

**Mapbox Directions API** có chất lượng gần như Google Maps, miễn phí 100,000 requests/tháng!

---

## 🚀 Setup Mapbox (Khuyên dùng)

### Bước 1: Đăng ký tài khoản

1. Truy cập: https://account.mapbox.com/auth/signup/
2. Đăng ký với email (miễn phí)
3. Xác nhận email

### Bước 2: Lấy Access Token

1. Đăng nhập vào https://account.mapbox.com/
2. Vào **Access tokens**
3. Copy **Default public token** hoặc tạo token mới
4. Token có dạng: `pk.eyJ1Ijoic...`

### Bước 3: Cấu hình trong project

Tạo/Sửa file `.env`:

```env
# Chọn Mapbox làm provider
VITE_ROUTING_PROVIDER=mapbox

# Paste token vào đây
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InlvdXJ0b2tlbiJ9.xxxxx

# Tắt mock data
VITE_USE_MOCK_ROUTING=false
```

### Bước 4: Restart server

```bash
# Stop server (Ctrl + C)
# Start lại
npm run dev
```

### Bước 5: Test

1. Vào **Quản lý Lộ trình**
2. Chọn học sinh trên bản đồ
3. Xem tuyến đường → Sẽ theo đường phố thực tế!

---

## 🔧 Setup OpenRouteService (Thay thế)

### Bước 1: Đăng ký

1. Truy cập: https://openrouteservice.org/dev/#/signup
2. Đăng ký (miễn phí)
3. Xác nhận email

### Bước 2: Lấy API Key

1. Đăng nhập vào https://openrouteservice.org/dev/#/home
2. Vào **Dashboard** → **TOKENS**
3. Copy API key
4. Key có dạng: `5b3ce3597851110001cf6248...`

### Bước 3: Cấu hình

File `.env`:

```env
VITE_ROUTING_PROVIDER=openrouteservice
VITE_ORS_API_KEY=5b3ce3597851110001cf6248xxxxxxxxxxxxx
VITE_USE_MOCK_ROUTING=false
```

### Bước 4: Restart & Test

```bash
npm run dev
```

---

## 🆓 Dùng OSRM (Không cần API key)

Nếu không muốn đăng ký, có thể dùng OSRM:

```env
VITE_ROUTING_PROVIDER=osrm
VITE_USE_MOCK_ROUTING=false
```

**Lưu ý:** Chất lượng không bằng Mapbox/ORS, nhưng hoàn toàn miễn phí.

---

## 🎭 Mock Data (Development)

Để development không cần internet:

```env
VITE_USE_MOCK_ROUTING=true
```

Tuyến đường sẽ được mô phỏng, không cần gọi API.

---

## 🔍 Kiểm tra cấu hình

Mở Console của browser (F12):

```
// Thấy log này là đúng
🗺️ Using routing provider: mapbox

// Hoặc
🗺️ Using routing provider: openrouteservice

// Hoặc mock
🎭 Using mock routing data
```

---

## 📊 So sánh kết quả

### OSRM (Miễn phí)
```
Trường → HS1 → HS2 → Trường
Khoảng cách: 4.5 km
Thời gian: 12 phút
Chất lượng: ⭐⭐⭐
```

### Mapbox (Free tier)
```
Trường → HS1 → HS2 → Trường
Khoảng cách: 4.8 km (chính xác hơn)
Thời gian: 13 phút (tính traffic)
Chất lượng: ⭐⭐⭐⭐⭐
```

### Google Maps (Trả phí)
```
Trường → HS1 → HS2 → Trường
Khoảng cách: 4.8 km
Thời gian: 13 phút (real-time traffic)
Chất lượng: ⭐⭐⭐⭐⭐
```

---

## 💰 Chi phí

### Mapbox Free Tier

- **100,000 requests/tháng** - MIỄN PHÍ
- Tính với 1 trường có 50 xe, mỗi xe tính route 1 lần/ngày:
  - 50 xe × 30 ngày = 1,500 requests/tháng
  - **→ Hoàn toàn trong free tier!**

### OpenRouteService Free Tier

- **2,000 requests/ngày** - MIỄN PHÍ
- 50 xe × 1 lần/ngày = 50 requests
  - **→ Dư giả!**

### OSRM

- **Unlimited** - MIỄN PHÍ
- Public server có rate limiting nhưng đủ dùng

---

## ❓ FAQ

### Q: Mapbox có thu phí không?

**A:** Miễn phí cho 100k requests/tháng. Một trường nhỏ/trung bình chỉ dùng ~1-2k/tháng.

### Q: Cần thẻ tín dụng không?

**A:** 
- **Mapbox**: Không cần thẻ cho free tier
- **OpenRouteService**: Không cần thẻ
- **OSRM**: Không cần đăng ký

### Q: API nào giống Google Maps nhất?

**A:** Mapbox (95% giống), sau đó là OpenRouteService (85%).

### Q: Có thể dùng nhiều API cùng lúc không?

**A:** Có thể, nhưng cần code thêm logic fallback.

### Q: Tôi nên dùng API nào?

**A:** 
- **Dự án thật, cần chính xác**: Mapbox
- **Dự án cá nhân, ít traffic**: OpenRouteService hoặc OSRM
- **Development/Demo**: Mock data

---

## 🐛 Troubleshooting

### Lỗi: "Mapbox access token not found"

```bash
# Kiểm tra .env
cat .env | grep MAPBOX

# Phải có dòng này:
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# Restart server
npm run dev
```

### Lỗi: "401 Unauthorized"

API key sai hoặc hết hạn. Lấy key mới từ dashboard.

### Tuyến đường vẫn không đúng

1. Check console log: `🗺️ Using routing provider: xxx`
2. Nếu thấy `🎭 Using mock`, nghĩa là đang dùng mock data
3. Check `.env` file có đúng không
4. Restart server

### Rate limit exceeded

Đã vượt quá free tier. Đổi sang provider khác hoặc chờ reset.

---

## 📚 Tài liệu API

- **Mapbox**: https://docs.mapbox.com/api/navigation/directions/
- **OpenRouteService**: https://openrouteservice.org/dev/#/api-docs
- **OSRM**: http://project-osrm.org/docs/v5.24.0/api/

---

## 🎯 Tóm tắt

1. **Development**: Dùng Mock data
2. **Demo**: Dùng OSRM (không cần setup)
3. **Production**: Dùng **Mapbox** (miễn phí, chất lượng cao)

**Khuyến nghị:** Setup Mapbox ngay từ đầu, chỉ mất 5 phút!

