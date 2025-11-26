# 📖 Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Xe Bus

## 🔐 Đăng Nhập

### Tài khoản Demo (Không cần Backend)

Sử dụng thông tin sau để đăng nhập:

```
Tên đăng nhập: admin
Mật khẩu: admin123
```

Tài khoản này hoạt động với dữ liệu mẫu, không cần kết nối backend.

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

### Bước 1: Cài đặt Dependencies

```bash
npm install
```

### Bước 2: Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ mở tại: http://localhost:3000

### Bước 3: Đăng nhập

Sử dụng tài khoản demo ở trên để đăng nhập.

---

## 📋 Các Tính Năng Chính

### 1. 📊 Dashboard
- Xem tổng quan thống kê: số xe, nhân viên, học sinh, lộ trình
- **Điểm danh hôm nay**: Theo dõi số nhân viên đi làm và học sinh đi học trong ngày
- Tỷ lệ tham gia của nhân viên và học sinh
- Theo dõi trạng thái xe
- Xem hoạt động gần đây
- Hiển thị ngày hiện tại

### 2. 👨‍✈️ Quản Lý Nhân Viên
- Thêm, sửa, xóa nhân viên (tài xế và phụ xe)
- Quản lý thông tin: tên, SĐT, email, địa chỉ, GPLX
- Phân loại theo chức vụ

### 3. 👨‍🎓 Quản Lý Học Sinh
- Thêm, sửa, xóa thông tin học sinh
- Lưu thông tin phụ huynh
- Liên kết với tài khoản phụ huynh trên app mobile
- **Chọn vị trí trên bản đồ**: Click trực tiếp trên bản đồ để chọn vị trí đón/trả học sinh

**Cách chọn vị trí học sinh:**
1. Trong form thêm/sửa học sinh, chuyển sang tab **"Chọn vị trí trên bản đồ"**
2. **Click trực tiếp** trên bản đồ tại vị trí đón/trả học sinh
3. Marker đỏ sẽ hiển thị vị trí đã chọn
4. Tọa độ sẽ tự động được cập nhật
5. Hoặc nhập tọa độ thủ công ở ô bên dưới bản đồ
6. Có thể dùng nút **"Vị trí của tôi"** để lấy vị trí hiện tại

**Ví dụ tọa độ Hà Nội:**
- Latitude: 21.0285
- Longitude: 105.8542

### 4. 👤 Quản Lý Tài Khoản
- Tạo tài khoản cho phụ huynh và phụ xe (dùng cho mobile app)
- Reset mật khẩu
- Khóa/mở khóa tài khoản

### 5. 🚌 Quản Lý Phương Tiện
- Thêm, sửa, xóa thông tin xe
- Quản lý biển số, loại xe, số chỗ ngồi
- Theo dõi trạng thái hoạt động/bảo trì

### 6. 🗺️ Quản Lý Lộ Trình (★ Tính năng quan trọng nhất)

#### Tạo Lộ Trình:
1. Click nút "Thêm lộ trình"
2. Nhập thông tin:
   - Tên lộ trình
   - Chọn xe bus
   - Chọn tài xế
   - Chọn phụ xe
   - Loại lộ trình (Đón sáng/Trả chiều)
   - Giờ bắt đầu và kết thúc
3. Click "Thêm mới"

#### Gán Học Sinh Cho Lộ Trình:
1. Trong danh sách lộ trình, click nút **"Xem"** ở cột "Bản đồ"
2. **Tab "Bản đồ"** sẽ hiển thị:
   - 📍 **Marker đỏ**: Trường học (điểm bắt đầu và kết thúc)
   - 📍 **Marker xanh dương**: Học sinh chưa được chọn
   - 📍 **Marker xanh lá có số**: Học sinh đã được chọn (số = thứ tự điểm đón)
   - 🛣️ **Đường màu xanh dương**: Tuyến đường thực tế xe bus sẽ đi (tính bằng OSRM API)
   - 📊 **Thông tin lộ trình** (góc phải trên): Khoảng cách và thời gian di chuyển
3. **Click vào marker học sinh** để chọn/bỏ chọn
4. Tuyến đường sẽ **tự động vẽ** kết nối: Trường → Học sinh 1 → Học sinh 2 → ... → Trường
5. Chuyển sang **tab "Danh sách đã chọn"** để:
   - Xem danh sách học sinh theo thứ tự
   - **Sắp xếp thứ tự** bằng nút mũi tên ↑↓
   - Xóa học sinh khỏi lộ trình
6. Click **"Lưu"** để gán học sinh vào lộ trình

**Lưu ý:** Thứ tự học sinh trong danh sách = thứ tự điểm đón trên lộ trình!

---

## 🔧 Cấu Hình Backend (Tùy chọn)

Khi đã có backend, tạo file `.env` với nội dung:

```env
VITE_API_URL=http://localhost:8000/api
```

Thay `http://localhost:8000/api` bằng URL backend của bạn.

---

## 🎨 Giao Diện

- **Responsive**: Hoạt động tốt trên desktop, tablet, mobile
- **Material-UI**: Giao diện hiện đại, đẹp mắt
- **Dark Sidebar**: Navigation dễ sử dụng
- **Tìm kiếm & Phân trang**: Có sẵn ở tất cả các bảng dữ liệu

---

## 💡 Tips & Tricks

### Chọn Vị Trí Học Sinh
**Cách 1: Chọn trực tiếp trên bản đồ (Khuyên dùng)**
1. Mở form thêm/sửa học sinh
2. Chuyển sang tab "Chọn vị trí trên bản đồ"
3. Click vào vị trí trên bản đồ
4. Tọa độ sẽ tự động được điền

**Cách 2: Tìm tọa độ trên mạng**
1. Truy cập: https://www.latlong.net/
2. Nhập địa chỉ hoặc click trên bản đồ
3. Copy tọa độ Latitude và Longitude
4. Paste vào form thêm học sinh (tab "Thông tin cơ bản")

### Phím Tắt
- **Enter**: Submit form
- **Esc**: Đóng dialog

### Lưu Ý
- Dữ liệu demo sẽ mất khi reload trang (chưa lưu vào database)
- Khi có backend, dữ liệu sẽ được lưu trữ vĩnh viễn

---

## 🆘 Hỗ Trợ

Nếu gặp lỗi:
1. Kiểm tra console của browser (F12)
2. Xem terminal có báo lỗi không
3. Thử xóa cache và reload: `Ctrl + Shift + R`
4. Restart development server: `Ctrl + C` rồi `npm run dev`

---

## 📞 Liên Hệ

- Email: support@schoolbus.com
- Phone: 024 1234 5678

© 2024 School Bus Management System

