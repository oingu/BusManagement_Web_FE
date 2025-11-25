# Hệ Thống Quản Lý Xe Bus Đưa Đón Học Sinh

Ứng dụng web quản lý điều phối xe bus đưa đón học sinh với đầy đủ các tính năng quản lý nhân viên, học sinh, phương tiện và lộ trình.

## Tính năng chính

- 🚌 **Quản lý Phương tiện**: Quản lý thông tin các xe bus
- 👨‍✈️ **Quản lý Nhân viên**: Quản lý tài xế và phụ xe
- 👨‍🎓 **Quản lý Học sinh**: Quản lý thông tin học sinh đi xe
- 👤 **Quản lý Tài khoản**: Quản lý tài khoản phụ huynh và phụ xe (cho mobile app)
- 🗺️ **Quản lý Lộ trình**: Lập lộ trình, gán học sinh, xem bản đồ vị trí học sinh
- 📊 **Dashboard**: Tổng quan thống kê hệ thống

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

Cấu hình API endpoint trong file `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Ghi chú

- Ứng dụng này là phần front-end dành cho nhà trường quản lý
- Tài khoản phụ huynh và phụ xe được quản lý ở đây nhưng dùng cho mobile app riêng biệt
- Bản đồ sử dụng OpenStreetMap (miễn phí) thông qua React Leaflet

