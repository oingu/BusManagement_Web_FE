# Hệ Thống Quản Lý Xe Bus Đưa Đón Học Sinh

Ứng dụng web quản lý điều phối xe bus đưa đón học sinh với đầy đủ các tính năng quản lý nhân viên, học sinh, phương tiện và lộ trình.

## Tính năng chính

- 🚌 **Quản lý Phương tiện**: Quản lý thông tin các xe bus
- 👨‍✈️ **Quản lý Nhân viên**: Quản lý tài xế và phụ xe
- 👨‍🎓 **Quản lý Học sinh**: Quản lý thông tin học sinh, **chọn vị trí trực tiếp trên bản đồ tương tác**, liên kết với tài khoản phụ huynh
- 👤 **Quản lý Tài khoản**: Quản lý tài khoản phụ huynh và phụ xe (cho mobile app), xem học sinh đã liên kết
- 🗺️ **Quản lý Lộ trình**: Lập lộ trình, gán học sinh, **vẽ tuyến đường thực tế** bằng OSRM API, tính khoảng cách và thời gian di chuyển, sắp xếp thứ tự điểm đón
- 📊 **Dashboard**: Tổng quan thống kê hệ thống, theo dõi điểm danh nhân viên và học sinh theo ngày

## Công nghệ sử dụng

- **React 18** - Framework UI
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **React Router v6** - Routing
- **React Leaflet** - Bản đồ tương tác
- **React Hook Form** - Quản lý form
- **Axios** - HTTP client

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

## Tài khoản Demo

Để đăng nhập vào hệ thống (khi chưa có backend), sử dụng tài khoản demo:

- **Tên đăng nhập**: `admin`
- **Mật khẩu**: `admin123`

Ứng dụng sẽ tự động chuyển sang chế độ demo với dữ liệu mẫu.

## Cấu trúc thư mục

```
src/
├── components/        # Các component dùng chung
├── pages/            # Các trang chính
├── layouts/          # Layout components
├── services/         # API services
├── contexts/         # React contexts
├── utils/            # Utility functions
└── assets/           # Static assets
```

## API Configuration

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình trong file `.env`:

```env
# Backend API
VITE_API_URL=http://localhost:8000/api

# Routing API (OSRM)
# Set to 'true' để dùng mock data, 'false' để dùng OSRM API thực
VITE_USE_MOCK_ROUTING=false
```

### Mock Data vs Real API

**Mock Data** (VITE_USE_MOCK_ROUTING=true):
- ✅ Không cần internet
- ✅ Tốc độ nhanh
- ✅ Dữ liệu nhất quán cho demo
- ⚠️ Chỉ dùng cho development/demo

**Real OSRM API** (VITE_USE_MOCK_ROUTING=false):
- ✅ Tuyến đường thực tế chính xác
- ✅ Khoảng cách và thời gian thực
- ⚠️ Cần kết nối internet

## Ghi chú

- Ứng dụng này là phần front-end dành cho nhà trường quản lý
- Tài khoản phụ huynh và phụ xe được quản lý ở đây nhưng dùng cho mobile app riêng biệt
- Bản đồ sử dụng OpenStreetMap (miễn phí) thông qua React Leaflet

