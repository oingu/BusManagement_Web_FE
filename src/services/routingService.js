import axios from 'axios'
import { mockCalculateRoute } from './mockRoutingData'
import { calculateMapboxRoute } from './mapboxRouting'
import { calculateORSRoute } from './openRouteService'

/**
 * Routing Service - Hỗ trợ nhiều provider
 * 
 * Các provider được hỗ trợ:
 * 1. OSRM (mặc định) - Miễn phí, không cần API key
 * 2. Mapbox - Chất lượng cao giống Google Maps (cần API key)
 * 3. OpenRouteService - Tốt, nhiều tính năng (cần API key)
 * 4. Mock - Dữ liệu giả lập cho development
 */

// Public OSRM server (miễn phí)
const OSRM_BASE_URL = 'https://router.project-osrm.org'

// Cấu hình
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_ROUTING === 'true' || false
const ROUTING_PROVIDER = import.meta.env.VITE_ROUTING_PROVIDER || 'osrm' // osrm, mapbox, openrouteservice

/**
 * Tính toán tuyến đường tối ưu giữa nhiều điểm
 * 
 * @param {Array} coordinates - Mảng các tọa độ [[lng, lat], [lng, lat], ...]
 * @param {Object} options - Tùy chọn routing
 * @returns {Promise} - Promise chứa thông tin tuyến đường
 */
export const calculateRoute = async (coordinates, options = {}) => {
  // Sử dụng mock data nếu được cấu hình
  if (USE_MOCK_DATA) {
    console.log('🎭 Using mock routing data')
    return mockCalculateRoute(coordinates, options)
  }

  // Chọn provider theo cấu hình
  console.log(`🗺️ Using routing provider: ${ROUTING_PROVIDER}`)
  
  try {
    switch (ROUTING_PROVIDER.toLowerCase()) {
      case 'mapbox':
        return await calculateMapboxRoute(coordinates, options)
      
      case 'openrouteservice':
      case 'ors':
        return await calculateORSRoute(coordinates, options)
      
      case 'osrm':
      default:
        return await calculateOSRMRoute(coordinates, options)
    }
  } catch (error) {
    console.error(`Error with ${ROUTING_PROVIDER}:`, error)
    console.log('⚠️ Falling back to mock data')
    // Fallback to mock data nếu tất cả API đều lỗi
    return mockCalculateRoute(coordinates, options)
  }
}

/**
 * OSRM routing (miễn phí, không cần API key)
 */
const calculateOSRMRoute = async (coordinates, options = {}) => {
  // OSRM yêu cầu tọa độ theo format: longitude,latitude
  const coordinatesString = coordinates
    .map(coord => `${coord[0]},${coord[1]}`)
    .join(';')

  // API endpoint: /route/v1/{profile}/{coordinates}
  // profile: car, bike, foot
  const profile = options.profile || 'car'
  const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coordinatesString}`

  const params = {
    overview: 'full', // Trả về toàn bộ geometry
    geometries: 'geojson', // Format geometry
    steps: true, // Bao gồm các bước rẽ
    annotations: true, // Thông tin chi tiết
  }

  const response = await axios.get(url, { params })

  if (response.data.code !== 'Ok') {
    throw new Error('Không thể tính toán tuyến đường')
  }

  const route = response.data.routes[0]

  return {
    success: true,
    coordinates: route.geometry.coordinates, // Mảng [lng, lat]
    distance: route.distance, // Khoảng cách (mét)
    duration: route.duration, // Thời gian (giây)
    legs: route.legs, // Thông tin từng đoạn
  }
}

/**
 * Tính toán ma trận khoảng cách giữa nhiều điểm
 * Hữu ích cho việc tối ưu thứ tự điểm đón
 * 
 * @param {Array} coordinates - Mảng các tọa độ [[lng, lat], ...]
 * @returns {Promise} - Ma trận khoảng cách và thời gian
 */
export const calculateDistanceMatrix = async (coordinates) => {
  try {
    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';')

    const url = `${OSRM_BASE_URL}/table/v1/car/${coordinatesString}`

    const params = {
      annotations: 'distance,duration',
    }

    const response = await axios.get(url, { params })

    if (response.data.code !== 'Ok') {
      throw new Error('Không thể tính toán ma trận khoảng cách')
    }

    return {
      success: true,
      distances: response.data.distances, // Ma trận khoảng cách (mét)
      durations: response.data.durations, // Ma trận thời gian (giây)
    }
  } catch (error) {
    console.error('Error calculating distance matrix:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Tối ưu thứ tự các điểm đón để có tuyến đường ngắn nhất
 * Sử dụng OSRM Trip service (giải bài toán TSP - Traveling Salesman Problem)
 * 
 * @param {Array} coordinates - Mảng các tọa độ [[lng, lat], ...]
 * @param {Object} options - Tùy chọn
 * @returns {Promise} - Thứ tự tối ưu và tuyến đường
 */
export const optimizeRoute = async (coordinates, options = {}) => {
  try {
    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';')

    const profile = options.profile || 'car'
    const url = `${OSRM_BASE_URL}/trip/v1/${profile}/${coordinatesString}`

    const params = {
      overview: 'full',
      geometries: 'geojson',
      steps: true,
      source: options.source || 'first', // Điểm bắt đầu
      destination: options.destination || 'last', // Điểm kết thúc
      roundtrip: options.roundtrip !== false, // Quay về điểm đầu
    }

    const response = await axios.get(url, { params })

    if (response.data.code !== 'Ok') {
      throw new Error('Không thể tối ưu tuyến đường')
    }

    const trip = response.data.trips[0]

    return {
      success: true,
      coordinates: trip.geometry.coordinates,
      distance: trip.distance,
      duration: trip.duration,
      waypoints: response.data.waypoints, // Thứ tự các điểm đã tối ưu
    }
  } catch (error) {
    console.error('Error optimizing route:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Format khoảng cách thành text dễ đọc
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format thời gian thành text dễ đọc
 */
export const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} phút`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} giờ ${remainingMinutes} phút`
}

/**
 * Các routing service khác có thể sử dụng:
 * 
 * 1. OpenRouteService (https://openrouteservice.org/)
 *    - Miễn phí với giới hạn
 *    - Cần API key
 * 
 * 2. Mapbox Directions API (https://docs.mapbox.com/api/navigation/directions/)
 *    - Tính năng mạnh, UI đẹp
 *    - Cần API key, có free tier
 * 
 * 3. Google Maps Directions API
 *    - Chất lượng tốt nhất
 *    - Trả phí, cần API key
 * 
 * 4. GraphHopper (https://www.graphhopper.com/)
 *    - Open source
 *    - Có phiên bản miễn phí
 */

export default {
  calculateRoute,
  calculateDistanceMatrix,
  optimizeRoute,
  formatDistance,
  formatDuration,
}

