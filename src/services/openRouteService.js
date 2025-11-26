/**
 * OpenRouteService API
 * 
 * Chất lượng tốt, nhiều tính năng
 * Free tier: 2,000 requests/ngày
 * 
 * Đăng ký API key: https://openrouteservice.org/dev/#/signup
 */

import axios from 'axios'

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || ''
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2'

/**
 * Calculate route using OpenRouteService API
 * 
 * @param {Array} coordinates - [[lng, lat], [lng, lat], ...]
 * @param {Object} options - routing options
 * @returns {Promise}
 */
export const calculateORSRoute = async (coordinates, options = {}) => {
  if (!ORS_API_KEY) {
    console.warn('⚠️ OpenRouteService API key not found. Please set VITE_ORS_API_KEY in .env')
    throw new Error('OpenRouteService API key required')
  }

  try {
    // Profile: driving-car, cycling-regular, foot-walking
    const profile = options.profile || 'driving-car'
    const url = `${ORS_BASE_URL}/directions/${profile}`

    const requestData = {
      coordinates: coordinates, // [[lng, lat], ...]
      instructions: true,
      elevation: false,
    }

    const response = await axios.post(url, requestData, {
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error('No routes found')
    }

    const route = response.data.routes[0]

    return {
      success: true,
      coordinates: route.geometry.coordinates, // [[lng, lat], ...]
      distance: route.summary.distance, // meters
      duration: route.summary.duration, // seconds
      legs: route.segments,
    }
  } catch (error) {
    console.error('Error calculating OpenRouteService route:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export default {
  calculateORSRoute,
}

