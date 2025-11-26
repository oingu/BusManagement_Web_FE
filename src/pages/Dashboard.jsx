import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Paper,
} from '@mui/material'
import {
  DirectionsBus,
  People,
  School,
  Route,
  TrendingUp,
  CheckCircle,
  Today,
} from '@mui/icons-material'
import { getDashboardStats } from '../services/api'

const StatCard = ({ title, value, icon, color, trend }) => (
  <Card
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'visible',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    }}
  >
    <CardContent sx={{ pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              <Typography variant="caption" color="success.main">
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            boxShadow: `0 4px 20px ${color}40`,
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalEmployees: 0,
    totalStudents: 0,
    totalRoutes: 0,
    activeVehicles: 0,
    employeesWorkingToday: 0,
    studentsAttendingToday: 0,
    loading: true,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats()
      setStats({
        ...response.data,
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set mock data for demo
      setStats({
        totalVehicles: 15,
        totalEmployees: 42,
        totalStudents: 320,
        totalRoutes: 12,
        activeVehicles: 12,
        employeesWorkingToday: 38,
        studentsAttendingToday: 305,
        loading: false,
      })
    }
  }

  if (stats.loading) {
    return <LinearProgress />
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'primary.main', color: 'white', px: 2, py: 1, borderRadius: 2 }}>
          <Today />
          <Typography variant="body1" fontWeight="bold">
            {new Date().toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Box>
      </Box>

      {/* Thống kê hôm nay */}
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        📊 Thống kê hôm nay
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nhân viên đi làm"
            value={`${stats.employeesWorkingToday}/${stats.totalEmployees}`}
            icon={<CheckCircle />}
            color="#2e7d32"
            trend={`${Math.round((stats.employeesWorkingToday / stats.totalEmployees) * 100)}% tỷ lệ`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Học sinh đi học"
            value={`${stats.studentsAttendingToday}/${stats.totalStudents}`}
            icon={<School />}
            color="#1565c0"
            trend={`${Math.round((stats.studentsAttendingToday / stats.totalStudents) * 100)}% tỷ lệ`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Xe hoạt động"
            value={`${stats.activeVehicles}/${stats.totalVehicles}`}
            icon={<DirectionsBus />}
            color="#ed6c02"
            trend={`${Math.round((stats.activeVehicles / stats.totalVehicles) * 100)}% sẵn sàng`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lộ trình hoạt động"
            value={stats.totalRoutes}
            icon={<Route />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Tổng quan hệ thống */}
      <Typography variant="h6" gutterBottom fontWeight="bold" color="text.secondary" sx={{ mt: 4 }}>
        📈 Tổng quan hệ thống
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số xe"
            value={stats.totalVehicles}
            icon={<DirectionsBus />}
            color="#1976d2"
            trend="+2 xe mới"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng nhân viên"
            value={stats.totalEmployees}
            icon={<People />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng học sinh"
            value={stats.totalStudents}
            icon={<School />}
            color="#4caf50"
            trend="+15 học sinh"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng lộ trình"
            value={stats.totalRoutes}
            icon={<Route />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Điểm danh hôm nay
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Nhân viên đi làm</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {stats.employeesWorkingToday}/{stats.totalEmployees}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.employeesWorkingToday / stats.totalEmployees) * 100}
                sx={{ height: 8, borderRadius: 4 }}
                color="success"
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Học sinh đi học</Typography>
                <Typography variant="body2" fontWeight="bold" color="primary.main">
                  {stats.studentsAttendingToday}/{stats.totalStudents}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.studentsAttendingToday / stats.totalStudents) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Nhân viên vắng</Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {stats.totalEmployees - stats.employeesWorkingToday}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Học sinh vắng</Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {stats.totalStudents - stats.studentsAttendingToday}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Tình trạng xe
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Đang hoạt động</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats.activeVehicles}/{stats.totalVehicles}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.activeVehicles / stats.totalVehicles) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Đang bảo trì</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stats.totalVehicles - stats.activeVehicles}/{stats.totalVehicles}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((stats.totalVehicles - stats.activeVehicles) / stats.totalVehicles) * 100}
                sx={{ height: 8, borderRadius: 4 }}
                color="warning"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Hoạt động gần đây
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold">
                  Thêm xe mới BKS: 29B-12345
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 giờ trước
                </Typography>
              </Box>
              <Box sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold">
                  Cập nhật lộ trình #5
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  5 giờ trước
                </Typography>
              </Box>
              <Box sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold">
                  Thêm 15 học sinh mới
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 ngày trước
                </Typography>
              </Box>
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  Bổ sung 3 nhân viên mới
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 ngày trước
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard

