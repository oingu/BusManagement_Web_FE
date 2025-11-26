# Routing API - Tuyến Đường Thực Tế

## Tổng quan

Ứng dụng sử dụng **OSRM (Open Source Routing Machine)** để tính toán tuyến đường thực tế trên bản đồ. OSRM là một engine routing mã nguồn mở, miễn phí, mạnh mẽ.

## API được sử dụng

### 1. OSRM (Hiện tại) - **Đã tích hợp** ✅

- **URL**: `https://router.project-osrm.org`
- **Miễn phí**: ✅ Hoàn toàn miễn phí
- **Không cần API Key**: ✅
- **Giới hạn**: Public server có rate limiting nhưng đủ cho sử dụng thông thường
- **Tính năng**:
  - Tính toán tuyến đường ngắn nhất/nhanh nhất
  - Hỗ trợ nhiều phương tiện: xe hơi, xe đạp, đi bộ
  - Tính ma trận khoảng cách
  - Tối ưu TSP (Traveling Salesman Problem)

### 2. Các API thay thế

#### OpenRouteService
- **URL**: `https://api.openrouteservice.org`
- **Miễn phí**: ✅ Có free tier
- **API Key**: ⚠️ Cần đăng ký
- **Giới hạn**: 2,000 requests/ngày (free tier)
- **Ưu điểm**: Nhiều tính năng, hỗ trợ isochrones

#### Mapbox Directions API
- **URL**: `https://api.mapbox.com`
- **Miễn phí**: ⚠️ Free tier 100,000 requests/tháng
- **API Key**: ⚠️ Cần đăng ký
- **Ưu điểm**: Chất lượng cao, nhiều tùy chọn

#### Google Maps Directions API
- **URL**: `https://maps.googleapis.com`
- **Miễn phí**: ❌ Trả phí ($5 per 1,000 requests)
- **API Key**: ⚠️ Cần đăng ký và thẻ tín dụng
- **Ưu điểm**: Chất lượng tốt nhất, dữ liệu traffic real-time

## Cách hoạt động

### 1. Tính toán tuyến đường

```javascript
import { calculateRoute } from '../services/routingService'

// Mảng tọa độ: [longitude, latitude]
const coordinates = [
  [105.8542, 21.0285], // Trường học
  [105.8612, 21.0315], // Học sinh 1
  [105.8482, 21.0255], // Học sinh 2
  [105.8542, 21.0285], // Quay về trường
]

const result = await calculateRoute(coordinates)

if (result.success) {
  console.log('Tuyến đường:', result.coordinates)
  console.log('Khoảng cách:', result.distance, 'mét')
  console.log('Thời gian:', result.duration, 'giây')
}
```

### 2. Tối ưu thứ tự điểm đón

```javascript
import { optimizeRoute } from '../services/routingService'

const result = await optimizeRoute(coordinates, {
  source: 'first',      // Bắt đầu từ điểm đầu tiên
  destination: 'last',  // Kết thúc ở điểm cuối
  roundtrip: true,      // Quay về điểm đầu
})

// Kết quả bao gồm thứ tự tối ưu
console.log('Thứ tự tối ưu:', result.waypoints)
```

## Sử dụng trong Component

### RouteMap Component

```jsx
<RouteMap
  students={students}
  selectedStudents={selectedStudents}
  showRoute={true}
  useRealRouting={true}  // Bật tuyến đường thực tế
/>
```

### Props:
- `useRealRouting`: `true` = dùng OSRM, `false` = vẽ đường thẳng
- `showRoute`: Hiển thị/ẩn tuyến đường
- Component tự động tính toán khi `selectedStudents` thay đổi

## Thông tin hiển thị

Khi sử dụng OSRM, bản đồ sẽ hiển thị:

1. **Tuyến đường màu xanh dương**: Đường thực tế xe bus sẽ đi
2. **Info box** (góc phải trên):
   - 🛣️ Khoảng cách: X km
   - ⏱️ Thời gian: X phút/giờ
   - Loading indicator khi đang tính toán

## Xử lý lỗi

Nếu OSRM không khả dụng hoặc có lỗi:
- Hệ thống tự động **fallback** về vẽ đường thẳng
- Không ảnh hưởng đến UX
- Console log error để debug

## Self-hosting OSRM (Tùy chọn)

Nếu muốn không phụ thuộc vào public server:

### Bước 1: Cài đặt Docker

```bash
docker pull osrm/osrm-backend
```

### Bước 2: Download dữ liệu bản đồ

```bash
# Download bản đồ Việt Nam từ Geofabrik
wget http://download.geofabrik.de/asia/vietnam-latest.osm.pbf
```

### Bước 3: Xử lý dữ liệu

```bash
# Extract
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/vietnam-latest.osm.pbf

# Partition
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/vietnam-latest.osrm

# Customize
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/vietnam-latest.osrm
```

### Bước 4: Chạy server

```bash
docker run -t -i -p 5000:5000 -v "${PWD}:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/vietnam-latest.osrm
```

### Bước 5: Cập nhật config

```javascript
// src/services/routingService.js
const OSRM_BASE_URL = 'http://localhost:5000' // Self-hosted
```

## Performance

### Tối ưu hóa:

1. **Caching**: Kết quả được cache tự động bởi useEffect
2. **Debouncing**: Chỉ tính toán lại khi selectedStudents thay đổi
3. **Fallback**: Luôn có đường thẳng làm backup

### Thời gian phản hồi:
- OSRM public server: ~200-500ms
- Self-hosted: ~50-100ms (tùy server)

## Giới hạn và Lưu ý

### OSRM Public Server:
- ✅ Miễn phí không giới hạn (có rate limiting)
- ⚠️ Không đảm bảo uptime 100%
- ⚠️ Không có SLA
- ✅ Đủ cho môi trường development và production nhỏ

### Khuyến nghị:
- Development: Dùng public server
- Production (traffic cao): Tự host OSRM
- Production (budget cao): Dùng Mapbox hoặc Google Maps

## Tài liệu tham khảo

- [OSRM Documentation](http://project-osrm.org/)
- [OSRM API Reference](https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md)
- [OpenRouteService](https://openrouteservice.org/)
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)

