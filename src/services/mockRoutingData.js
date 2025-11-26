/**
 * Mock data cho Routing Service
 * Dùng để test và demo mà không cần gọi API thực
 */

// Các địa điểm thực tế tại Hà Nội
export const HANOI_LOCATIONS = {
  // Trường học (giả định)
  school: {
    name: 'Trường Tiểu học ABC',
    lat: 21.0285,
    lng: 105.8542,
    address: '123 Đường Láng, Đống Đa, Hà Nội',
  },
  
  // Các địa điểm đón học sinh
  students: [
    {
      id: 1,
      name: 'Nguyễn Văn Nam',
      lat: 21.0315,
      lng: 105.8612,
      address: '45 Ngõ 123, Đường Láng',
    },
    {
      id: 2,
      name: 'Trần Thị Lan',
      lat: 21.0245,
      lng: 105.8482,
      address: '78 Phố Huế',
    },
    {
      id: 3,
      name: 'Lê Văn Hùng',
      lat: 21.0355,
      lng: 105.8585,
      address: '12 Nguyễn Lương Bằng',
    },
    {
      id: 4,
      name: 'Phạm Thị Mai',
      lat: 21.0225,
      lng: 105.8565,
      address: '34 Khâm Thiên',
    },
    {
      id: 5,
      name: 'Hoàng Văn Đức',
      lat: 21.0295,
      lng: 105.8625,
      address: '56 Tôn Đức Thắng',
    },
  ],
}

// Mock response từ OSRM API - Tuyến đường chi tiết
// Đây là tuyến đường giả lập đi qua các đường phố thực tế tại Hà Nội
export const MOCK_ROUTE_RESPONSE = {
  success: true,
  coordinates: [
    // Từ trường học
    [105.8542, 21.0285],
    [105.8545, 21.0288],
    [105.8550, 21.0290],
    [105.8555, 21.0292],
    [105.8560, 21.0295],
    [105.8565, 21.0298],
    [105.8570, 21.0300],
    [105.8575, 21.0302],
    [105.8580, 21.0305],
    [105.8585, 21.0307],
    [105.8590, 21.0310],
    [105.8595, 21.0312],
    [105.8600, 21.0314],
    [105.8605, 21.0315],
    [105.8610, 21.0315],
    // Đến học sinh 1
    [105.8612, 21.0315],
    
    // Từ học sinh 1 đến học sinh 2
    [105.8610, 21.0313],
    [105.8605, 21.0310],
    [105.8600, 21.0307],
    [105.8595, 21.0305],
    [105.8590, 21.0302],
    [105.8585, 21.0300],
    [105.8580, 21.0297],
    [105.8575, 21.0295],
    [105.8570, 21.0292],
    [105.8565, 21.0290],
    [105.8560, 21.0287],
    [105.8555, 21.0285],
    [105.8550, 21.0282],
    [105.8545, 21.0280],
    [105.8540, 21.0277],
    [105.8535, 21.0275],
    [105.8530, 21.0272],
    [105.8525, 21.0270],
    [105.8520, 21.0267],
    [105.8515, 21.0265],
    [105.8510, 21.0262],
    [105.8505, 21.0260],
    [105.8500, 21.0257],
    [105.8495, 21.0255],
    [105.8490, 21.0252],
    [105.8485, 21.0248],
    // Đến học sinh 2
    [105.8482, 21.0245],
    
    // Từ học sinh 2 đến học sinh 3
    [105.8485, 21.0248],
    [105.8490, 21.0252],
    [105.8495, 21.0257],
    [105.8500, 21.0262],
    [105.8505, 21.0267],
    [105.8510, 21.0272],
    [105.8515, 21.0277],
    [105.8520, 21.0282],
    [105.8525, 21.0287],
    [105.8530, 21.0292],
    [105.8535, 21.0297],
    [105.8540, 21.0302],
    [105.8545, 21.0307],
    [105.8550, 21.0312],
    [105.8555, 21.0317],
    [105.8560, 21.0322],
    [105.8565, 21.0327],
    [105.8570, 21.0332],
    [105.8575, 21.0337],
    [105.8580, 21.0342],
    [105.8585, 21.0347],
    // Đến học sinh 3
    [105.8585, 21.0355],
    
    // Quay về trường
    [105.8583, 21.0350],
    [105.8580, 21.0345],
    [105.8577, 21.0340],
    [105.8574, 21.0335],
    [105.8571, 21.0330],
    [105.8568, 21.0325],
    [105.8565, 21.0320],
    [105.8562, 21.0315],
    [105.8559, 21.0310],
    [105.8556, 21.0305],
    [105.8553, 21.0300],
    [105.8550, 21.0295],
    [105.8547, 21.0290],
    [105.8544, 21.0287],
    // Về trường
    [105.8542, 21.0285],
  ],
  distance: 4850, // 4.85 km
  duration: 780, // 13 phút
}

// Mock data cho nhiều tuyến đường khác nhau
export const MOCK_ROUTES = {
  // Tuyến 1: 3 điểm đón
  route1: {
    name: 'Lộ trình 1 - Khu vực Đống Đa',
    students: [
      HANOI_LOCATIONS.students[0],
      HANOI_LOCATIONS.students[1],
      HANOI_LOCATIONS.students[2],
    ],
    routeData: MOCK_ROUTE_RESPONSE,
  },
  
  // Tuyến 2: 5 điểm đón
  route2: {
    name: 'Lộ trình 2 - Khu vực Hai Bà Trưng',
    students: HANOI_LOCATIONS.students,
    routeData: {
      success: true,
      coordinates: generateMockCoordinates([
        [105.8542, 21.0285], // Trường
        [105.8612, 21.0315], // HS1
        [105.8482, 21.0245], // HS2
        [105.8585, 21.0355], // HS3
        [105.8565, 21.0225], // HS4
        [105.8625, 21.0295], // HS5
        [105.8542, 21.0285], // Về trường
      ]),
      distance: 8250, // 8.25 km
      duration: 1380, // 23 phút
    },
  },
  
  // Tuyến 3: Tuyến ngắn (2 điểm đón)
  route3: {
    name: 'Lộ trình 3 - Tuyến ngắn',
    students: [
      HANOI_LOCATIONS.students[0],
      HANOI_LOCATIONS.students[4],
    ],
    routeData: {
      success: true,
      coordinates: generateMockCoordinates([
        [105.8542, 21.0285], // Trường
        [105.8612, 21.0315], // HS1
        [105.8625, 21.0295], // HS5
        [105.8542, 21.0285], // Về trường
      ]),
      distance: 3200, // 3.2 km
      duration: 540, // 9 phút
    },
  },
}

/**
 * Hàm tạo tọa độ chi tiết giữa các điểm (mô phỏng đường đi thực tế)
 * Tạo các điểm trung gian để đường đi trông mượt mà hơn
 */
function generateMockCoordinates(waypoints) {
  const detailedCoordinates = []
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i]
    const end = waypoints[i + 1]
    
    // Thêm điểm bắt đầu
    detailedCoordinates.push(start)
    
    // Tạo 8-15 điểm trung gian ngẫu nhiên
    const numPoints = Math.floor(Math.random() * 8) + 8
    
    for (let j = 1; j < numPoints; j++) {
      const ratio = j / numPoints
      
      // Tính toán với một chút biến động để tạo đường cong tự nhiên
      const variation = (Math.random() - 0.5) * 0.0005
      
      const lng = start[0] + (end[0] - start[0]) * ratio + variation
      const lat = start[1] + (end[1] - start[1]) * ratio + variation * 0.5
      
      detailedCoordinates.push([lng, lat])
    }
  }
  
  // Thêm điểm cuối
  detailedCoordinates.push(waypoints[waypoints.length - 1])
  
  return detailedCoordinates
}

/**
 * Mock function để thay thế calculateRoute trong development
 */
export const mockCalculateRoute = async (coordinates, options = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Tạo tuyến đường chi tiết từ các điểm
  const detailedCoordinates = generateMockCoordinates(coordinates)
  
  // Tính khoảng cách ước lượng
  const distance = estimateDistance(coordinates)
  
  // Tính thời gian (giả định tốc độ trung bình 25km/h)
  const duration = (distance / 25000) * 3600 // giây
  
  return {
    success: true,
    coordinates: detailedCoordinates,
    distance: Math.round(distance),
    duration: Math.round(duration),
    legs: coordinates.length - 1,
  }
}

/**
 * Ước lượng khoảng cách giữa các điểm (công thức Haversine đơn giản)
 */
function estimateDistance(coordinates) {
  let totalDistance = 0
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i]
    const [lng2, lat2] = coordinates[i + 1]
    
    // Haversine formula
    const R = 6371000 // Bán kính Trái Đất (mét)
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    totalDistance += distance
  }
  
  // Nhân với 1.3 để tính cho đường đi không thẳng
  return totalDistance * 1.3
}

function toRad(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Mock học sinh với tọa độ thực tế tại Hà Nội
 */
export const MOCK_STUDENTS_WITH_LOCATION = [
  {
    id: 1,
    name: 'Nguyễn Văn Nam',
    studentCode: 'HS001',
    grade: '5',
    className: '5A',
    parentName: 'Nguyễn Văn Cha',
    parentPhone: '0901234567',
    parentAccountId: 1,
    parentAccountName: 'Nguyễn Văn Cha',
    address: '45 Ngõ 123, Đường Láng, Đống Đa',
    latitude: 21.0315,
    longitude: 105.8612,
    status: 'Hoạt động',
  },
  {
    id: 2,
    name: 'Trần Thị Lan',
    studentCode: 'HS002',
    grade: '4',
    className: '4B',
    parentName: 'Trần Văn Cha',
    parentPhone: '0902345678',
    parentAccountId: 2,
    parentAccountName: 'Trần Văn Cha',
    address: '78 Phố Huế, Hai Bà Trưng',
    latitude: 21.0245,
    longitude: 105.8482,
    status: 'Hoạt động',
  },
  {
    id: 3,
    name: 'Lê Văn Hùng',
    studentCode: 'HS003',
    grade: '5',
    className: '5B',
    parentName: 'Lê Văn Bố',
    parentPhone: '0903456789',
    parentAccountId: 1,
    parentAccountName: 'Nguyễn Văn Cha',
    address: '12 Nguyễn Lương Bằng, Đống Đa',
    latitude: 21.0355,
    longitude: 105.8585,
    status: 'Hoạt động',
  },
  {
    id: 4,
    name: 'Phạm Thị Mai',
    studentCode: 'HS004',
    grade: '3',
    className: '3A',
    parentName: 'Phạm Văn Cha',
    parentPhone: '0904567890',
    parentAccountId: 3,
    parentAccountName: 'Phạm Văn Cha',
    address: '34 Khâm Thiên, Đống Đa',
    latitude: 21.0225,
    longitude: 105.8565,
    status: 'Hoạt động',
  },
  {
    id: 5,
    name: 'Hoàng Văn Đức',
    studentCode: 'HS005',
    grade: '4',
    className: '4A',
    parentName: 'Hoàng Thị Mẹ',
    parentPhone: '0905678901',
    parentAccountId: 4,
    parentAccountName: 'Hoàng Thị Mẹ',
    address: '56 Tôn Đức Thắng, Đống Đa',
    latitude: 21.0295,
    longitude: 105.8625,
    status: 'Hoạt động',
  },
  {
    id: 6,
    name: 'Vũ Thị Hương',
    studentCode: 'HS006',
    grade: '5',
    className: '5C',
    parentName: 'Vũ Văn Cha',
    parentPhone: '0906789012',
    parentAccountId: 5,
    parentAccountName: 'Vũ Văn Cha',
    address: '89 Giải Phóng, Hai Bà Trưng',
    latitude: 21.0195,
    longitude: 105.8495,
    status: 'Hoạt động',
  },
  {
    id: 7,
    name: 'Đỗ Văn Tùng',
    studentCode: 'HS007',
    grade: '3',
    className: '3B',
    parentName: 'Đỗ Thị Mẹ',
    parentPhone: '0907890123',
    parentAccountId: 6,
    parentAccountName: 'Đỗ Thị Mẹ',
    address: '23 Phố Vọng, Hai Bà Trưng',
    latitude: 21.0265,
    longitude: 105.8515,
    status: 'Hoạt động',
  },
]

export default {
  HANOI_LOCATIONS,
  MOCK_ROUTE_RESPONSE,
  MOCK_ROUTES,
  mockCalculateRoute,
  MOCK_STUDENTS_WITH_LOCATION,
}

