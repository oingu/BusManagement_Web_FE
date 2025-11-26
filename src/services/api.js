import axios from 'axios'

// API Base URL - cập nhật theo backend của bạn
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication
export const login = (username, password) => {
  return api.post('/auth/login', { username, password })
}

export const logout = () => {
  return api.post('/auth/logout')
}

// Employees (Nhân viên)
export const getEmployees = () => api.get('/employees')
export const getEmployee = (id) => api.get(`/employees/${id}`)
export const createEmployee = (data) => api.post('/employees', data)
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/employees/${id}`)

// Students (Học sinh)
export const getStudents = () => api.get('/students')
export const getStudent = (id) => api.get(`/students/${id}`)
export const createStudent = (data) => api.post('/students', data)
export const updateStudent = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/students/${id}`)

// Accounts (Tài khoản)
export const getAccounts = () => api.get('/accounts')
export const getAccount = (id) => api.get(`/accounts/${id}`)
export const createAccount = (data) => api.post('/accounts', data)
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data)
export const deleteAccount = (id) => api.delete(`/accounts/${id}`)
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

// Vehicles (Phương tiện)
export const getVehicles = () => api.get('/vehicles')
export const getVehicle = (id) => api.get(`/vehicles/${id}`)
export const createVehicle = (data) => api.post('/vehicles', data)
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data)
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`)

// Routes (Lộ trình)
export const getRoutes = () => api.get('/routes')
export const getRoute = (id) => api.get(`/routes/${id}`)
export const createRoute = (data) => api.post('/routes', data)
export const updateRoute = (id, data) => api.put(`/routes/${id}`, data)
export const deleteRoute = (id) => api.delete(`/routes/${id}`)
export const assignStudentsToRoute = (routeId, studentIds) => 
  api.post(`/routes/${routeId}/students`, { studentIds })
export const removeStudentFromRoute = (routeId, studentId) => 
  api.delete(`/routes/${routeId}/students/${studentId}`)

// Dashboard statistics
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getTodayAttendance = () => api.get('/dashboard/attendance/today')

export default api

