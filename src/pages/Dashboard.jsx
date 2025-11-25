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
        loading: false,
      })
    }
  }

  if (stats.loading) {
    return <LinearProgress />
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Dashboard
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
            title="Nhân viên"
            value={stats.totalEmployees}
            icon={<People />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Học sinh"
            value={stats.totalStudents}
            icon={<School />}
            color="#4caf50"
            trend="+15 học sinh"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lộ trình"
            value={stats.totalRoutes}
            icon={<Route />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
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

