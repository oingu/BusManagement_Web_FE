/**
 * Mapbox Directions API
 * 
 * Chất lượng cao, gần với Google Maps
 * Free tier: 100,000 requests/tháng
 * 
 * Đăng ký API key: https://account.mapbox.com/
 */

import axios from 'axios'

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const MAPBOX_BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox'

/**
 * Calculate route using Mapbox Directions API
 * 
 * @param {Array} coordinates - [[lng, lat], [lng, lat], ...]
 * @param {Object} options - routing options
 * @returns {Promise}
 */
export const calculateMapboxRoute = async (coordinates, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    console.warn('⚠️ Mapbox access token not found. Please set VITE_MAPBOX_ACCESS_TOKEN in .env')
    throw new Error('Mapbox access token required')
  }

  try {
    // Format coordinates: lng,lat;lng,lat;...
    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';')

    // Profile: driving, driving-traffic, walking, cycling
    const profile = options.profile || 'driving'
    const url = `${MAPBOX_BASE_URL}/${profile}/${coordinatesString}`

    const params = {
      access_token: MAPBOX_ACCESS_TOKEN,
      geometries: 'geojson',
      overview: 'full',
      steps: true,
      alternatives: false, // Set true để lấy nhiều tuyến đường
    }

    const response = await axios.get(url, { params })

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No routes found')
    }

    const route = response.data.routes[0]

    return {
      success: true,
      coordinates: route.geometry.coordinates, // [[lng, lat], ...]
      distance: route.distance, // meters
      duration: route.duration, // seconds
      legs: route.legs,
    }
  } catch (error) {
    console.error('Error calculating Mapbox route:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export default {
  calculateMapboxRoute,
}

