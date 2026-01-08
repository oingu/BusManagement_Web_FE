import axios from 'axios'

// API Base URL - cập nhật theo backend của bạn
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://34.61.124.56/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors with refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        // No refresh token, redirect to login
        clearTokensAndRedirect()
        return Promise.reject(error)
      }

      try {
        // Call refresh token API
        const response = await axios.post(`${API_BASE_URL}/refresh`, {
          refresh_token: refreshToken
        })

        const newAccessToken = response.data.token?.access_token || response.data.access_token
        const newRefreshToken = response.data.token?.refresh_token || response.data.refresh_token

        // Save new tokens
        localStorage.setItem('access_token', newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken)
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokensAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Helper function to clear tokens and redirect
const clearTokensAndRedirect = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// Authentication
export const login = (data) => {
  return api.post('/login', data)
}

export const logout = () => {
  const token = localStorage.getItem('access_token')
  return api.post('/logout', { token })
}

// Employees (Nhân viên)
export const getEmployees = (params) => api.get('/drivers', { params })
export const getEmployee = (id) => api.get(`/drivers/${id}`)
export const createEmployee = (data) => api.post('/drivers', data)
export const updateEmployee = (id, data) => api.put(`/drivers/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/drivers/${id}`)

// Students (Học sinh)
export const getStudents = (params) => api.get('/students', { params })
export const getAllStudents = () => api.get('/students/all')
export const getStudent = (id) => api.get(`/students/${id}`)
export const createStudent = (data) => api.post('/students', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}`)

// Accounts (Tài khoản)
export const getAccounts = (params) => api.get('/users', { params })
export const getAccount = (id) => api.get(`/users/${id}`)
export const createAccount = (data) => api.post('/users', data)
export const updateAccount = (id, data) => api.put(`/users/${id}`, data)
export const deleteAccount = (id) => api.delete(`/users/${id}`)
export const resetPassword = (id) => api.post(`/accounts/${id}/reset-password`)
// Get parent accounts only
export const getParentAccounts = () => api.get('/accounts/parents')
// Link/unlink students with parent account
export const linkStudentToParent = (parentId, studentId) =>
  api.post(`/accounts/${parentId}/students/${studentId}`)
export const unlinkStudentFromParent = (parentId, studentId) =>
  api.delete(`/accounts/${parentId}/students/${studentId}`)
export const getStudentsByParent = (parentId) =>
  api.get(`/accounts/${parentId}/students`)

// Student Parents (Phụ huynh học sinh)
export const getStudentParents = (params) => api.get('/student-parents', { params })
export const getStudentParent = (id) => api.get(`/student-parents/${id}`)
export const createStudentParent = (data) => api.post('/student-parents', data)
export const updateStudentParent = (id, data) => api.put(`/student-parents/${id}`, data)
export const deleteStudentParent = (id) => api.delete(`/student-parents/${id}`)

// Vehicles (Phương tiện)
export const getVehicles = (params = {}) => {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.append('page', params.page)
  if (params.per_page) queryParams.append('per_page', params.per_page)
  const queryString = queryParams.toString()
  return api.get(`/vehicles${queryString ? `?${queryString}` : ''}`)
}
export const getAllVehicles = () => api.get('/vehicles/all')
export const getVehicle = (id) => api.get(`/vehicles/${id}`)
export const createVehicle = (data) => api.post('/vehicles', data)
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`)

// Drivers (Tài xế & Phụ xe) - All without pagination
export const getAllDrivers = (params = {}) => api.get('/drivers/all', { params })

// Routes/Trips (Lộ trình)
export const getRoutes = (params) => api.get('/trips', { params })
export const getRoute = (id) => api.get(`/trips/${id}`)
export const createRoute = (data) => api.post('/trips', data)
export const updateRoute = (id, data) => api.put(`/trips/${id}`, data)
export const deleteRoute = (id) => api.delete(`/trips/${id}`)
export const assignStudentsToRoute = (routeId, studentIds) =>
  api.post(`/trips/${routeId}/students`, { studentIds })
export const removeStudentFromRoute = (routeId, studentId) =>
  api.delete(`/trips/${routeId}/students/${studentId}`)
export const getTripPoints = (tripId) => api.get(`/trips/${tripId}/points`)

// Points (Điểm dừng)
export const getPoints = (params) => api.get('/points', { params })
export const getAllPoints = () => api.get('/points/all')
export const getPoint = (id) => api.get(`/points/${id}`)
export const createPoint = (data) => api.post('/points', data)
export const updatePoint = (id, data) => api.put(`/points/${id}`, data)
export const deletePoint = (id) => api.delete(`/points/${id}`)

// Assign students to points in a trip
export const assignPointStudents = (tripId, data) =>
  api.post(`/trips/${tripId}/assign-point-students`, data)

// Dashboard statistics
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getTodayAttendance = () => api.get('/dashboard/attendance/today')

export default api

