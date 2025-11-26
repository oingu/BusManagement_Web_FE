# Hướng Dẫn Demo Ứng Dụng

## 📋 Tổng quan

Hướng dẫn này giúp bạn demo ứng dụng quản lý xe bus với dữ liệu mẫu đầy đủ và tuyến đường thực tế.

## 🚀 Chạy ứng dụng

### Bước 1: Cài đặt

```bash
npm install
```

### Bước 2: Cấu hình (Tùy chọn)

Tạo file `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```env
# Dùng mock data cho routing (không cần internet)
VITE_USE_MOCK_ROUTING=true

# Hoặc dùng API thực
VITE_USE_MOCK_ROUTING=false
```

### Bước 3: Chạy

```bash
npm run dev
```

## 🔐 Đăng nhập

```
Tên đăng nhập: admin
Mật khẩu: admin123
```

## 📍 Dữ liệu Mock

### Học sinh (7 học sinh)

Tất cả học sinh đều có tọa độ thực tế tại **Hà Nội**:

1. **Nguyễn Văn Nam** (HS001)
   - Lớp: 5A
   - Địa chỉ: 45 Ngõ 123, Đường Láng, Đống Đa
   - Tọa độ: 21.0315°N, 105.8612°E

2. **Trần Thị Lan** (HS002)
   - Lớp: 4B
   - Địa chỉ: 78 Phố Huế, Hai Bà Trưng
   - Tọa độ: 21.0245°N, 105.8482°E

3. **Lê Văn Hùng** (HS003)
   - Lớp: 5B
   - Địa chỉ: 12 Nguyễn Lương Bằng, Đống Đa
   - Tọa độ: 21.0355°N, 105.8585°E

4. **Phạm Thị Mai** (HS004)
   - Lớp: 3A
   - Địa chỉ: 34 Khâm Thiên, Đống Đa
   - Tọa độ: 21.0225°N, 105.8565°E

5. **Hoàng Văn Đức** (HS005)
   - Lớp: 4A
   - Địa chỉ: 56 Tôn Đức Thắng, Đống Đa
   - Tọa độ: 21.0295°N, 105.8625°E

6. **Vũ Thị Hương** (HS006)
   - Lớp: 5C
   - Địa chỉ: 89 Giải Phóng, Hai Bà Trưng
   - Tọa độ: 21.0195°N, 105.8495°E

7. **Đỗ Văn Tùng** (HS007)
   - Lớp: 3B
   - Địa chỉ: 23 Phố Vọng, Hai Bà Trưng
   - Tọa độ: 21.0265°N, 105.8515°E

### Trường học

- **Trường Tiểu học ABC**
- Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội
- Tọa độ: 21.0285°N, 105.8542°E

## 🗺️ Demo Tính năng Bản đồ

### Kịch bản Demo 1: Tạo lộ trình đơn giản

1. Vào **Quản lý Lộ trình**
2. Click **"Thêm lộ trình"**
3. Điền thông tin:
   - Tên: "Demo - Lộ trình ngắn"
   - Chọn xe, tài xế, phụ xe
   - Thời gian: 07:00 - 08:00
4. Lưu
5. Click nút **"Xem"** ở cột Bản đồ

### Kịch bản Demo 2: Gán học sinh và xem tuyến đường

**Tab "Bản đồ":**

1. Click chọn **3 học sinh** trên bản đồ:
   - Nguyễn Văn Nam (Marker 1)
   - Trần Thị Lan (Marker 2)
   - Lê Văn Hùng (Marker 3)

2. Quan sát:
   - ✅ Marker có số thứ tự (1, 2, 3)
   - ✅ Đường màu xanh dương vẽ tự động
   - ✅ Info box hiển thị khoảng cách và thời gian

**Tab "Danh sách đã chọn":**

1. Xem danh sách 3 học sinh
2. Dùng nút ↑↓ để **sắp xếp thứ tự**
3. Quan sát bản đồ tự động cập nhật

**Lưu:**

1. Click **"Lưu"**
2. Lộ trình đã có 3 học sinh

### Kịch bản Demo 3: So sánh Mock vs Real API

**Với Mock Data:**

```env
VITE_USE_MOCK_ROUTING=true
```

- Tốc độ: ~500ms
- Tuyến đường: Smooth, mượt mà
- Khoảng cách: ~4.85 km
- Thời gian: ~13 phút
- ✅ Hoạt động offline

**Với Real OSRM API:**

```env
VITE_USE_MOCK_ROUTING=false
```

- Tốc độ: ~200-500ms
- Tuyến đường: Theo đường phố thực tế
- Khoảng cách: Chính xác
- Thời gian: Chính xác
- ⚠️ Cần internet

## 📊 Demo Dashboard

Vào **Dashboard** để xem:

- 📈 Thống kê hôm nay:
  - Nhân viên đi làm: 38/42 (90%)
  - Học sinh đi học: 305/320 (95%)
  
- 📊 Tổng quan hệ thống:
  - Tổng xe: 15
  - Tổng nhân viên: 42
  - Tổng học sinh: 320
  - Tổng lộ trình: 12

## 👨‍🎓 Demo Quản lý Học sinh

### Thêm học sinh với bản đồ

1. Vào **Quản lý Học sinh**
2. Click **"Thêm học sinh"**
3. **Tab "Thông tin cơ bản"**: Điền thông tin
4. **Tab "Chọn vị trí trên bản đồ"**:
   - Click trên bản đồ để chọn vị trí
   - Hoặc nhập tọa độ thủ công
   - Hoặc dùng nút "Vị trí của tôi"
5. Lưu

## 🎨 Highlight Features để Demo

### 1. Bản đồ tương tác
- ✨ Click để chọn vị trí
- 🎯 Marker có số thứ tự
- 🛣️ Tuyến đường tự động

### 2. Routing thực tế
- 📏 Khoảng cách chính xác
- ⏱️ Thời gian di chuyển
- 🗺️ Theo đường phố thực tế

### 3. Sắp xếp thứ tự
- ⬆️⬇️ Di chuyển điểm đón
- 🔄 Bản đồ tự động cập nhật
- 📱 UI responsive

### 4. Liên kết phụ huynh
- 👨‍👩‍👧 Một phụ huynh - nhiều con
- 📱 Tài khoản mobile app
- 🔗 Quản lý dễ dàng

### 5. Dashboard real-time
- 📊 Điểm danh hôm nay
- 📈 Tỷ lệ tham gia
- 📅 Ngày hiện tại

## 🎭 Tips Demo

### Chuẩn bị trước:

1. Clear browser cache
2. Mở ứng dụng sẵn
3. Đăng nhập trước
4. Chuẩn bị 2 tab:
   - Tab 1: Dashboard
   - Tab 2: Quản lý Lộ trình

### Trong khi demo:

1. **Bắt đầu từ Dashboard**:
   - Giới thiệu tổng quan
   - Số liệu ấn tượng

2. **Chuyển sang Lộ trình**:
   - Tạo lộ trình mới
   - Demo bản đồ (WOW moment)
   - Chọn 3-4 học sinh
   - Xem tuyến đường

3. **Highlight sắp xếp**:
   - Sắp xếp thứ tự
   - Bản đồ tự động update
   - Info box thay đổi

4. **Kết thúc với tính năng khác**:
   - Quản lý học sinh với map picker
   - Liên kết phụ huynh
   - Dashboard statistics

### Câu chuyện demo:

> "Buổi sáng, nhà trường cần lập lộ trình đón học sinh. 
> Hệ thống cho phép chọn học sinh trên bản đồ, 
> tự động tính tuyến đường tối ưu, 
> hiển thị khoảng cách 4.8km và thời gian 13 phút.
> Nếu cần thay đổi thứ tự, chỉ cần kéo thả,
> bản đồ tự động cập nhật theo thời gian thực."

## 🐛 Troubleshooting

### Bản đồ không hiển thị:

```bash
# Check console errors
# Có thể do Leaflet CSS chưa load

# Solution: Hard refresh
Cmd/Ctrl + Shift + R
```

### Tuyến đường không vẽ:

```env
# Dùng mock data
VITE_USE_MOCK_ROUTING=true
```

### API lỗi:

- Hệ thống tự động fallback về mock data
- Check console log

## 📝 Script Demo (5 phút)

```
[0:00] Chào mừng đến với hệ thống quản lý xe bus học sinh

[0:30] Dashboard: 38 nhân viên, 305 học sinh đi học hôm nay

[1:00] Vào Quản lý Lộ trình

[1:30] Tạo lộ trình mới "Demo Route"

[2:00] Click "Xem bản đồ" - Chọn 3 học sinh

[2:30] WOW! Tuyến đường tự động vẽ - 4.8km, 13 phút

[3:00] Tab "Danh sách" - Sắp xếp thứ tự

[3:30] Bản đồ tự động cập nhật!

[4:00] Bonus: Map picker cho học sinh

[4:30] Questions?
```

## 🎓 Các case sử dụng thực tế

1. **Sáng**: Tạo lộ trình đón học sinh
2. **Chiều**: Tạo lộ trình trả học sinh
3. **Cuối tuần**: Xem lại, tối ưu lộ trình
4. **Đầu năm**: Thêm học sinh mới với map picker
5. **Hàng ngày**: Theo dõi điểm danh qua Dashboard

---

Made with ❤️ for school bus management

