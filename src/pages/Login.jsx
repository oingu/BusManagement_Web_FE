import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  DirectionsBus,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(username, password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffd54f 0%, #ff6f00 100%)', // Gradient vàng-cam
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #fbc02d 0%, #f57f17 100%)', // Gradient vàng đậm
              py: 4,
              px: 3,
              textAlign: 'center',
            }}
          >
            <DirectionsBus sx={{ fontSize: 60, color: 'white', mb: 2 }} />
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
              Hệ Thống Quản Lý
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 400, mt: 1 }}>
              Xe Bus Học Sinh
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ mb: 3, fontWeight: 600 }}
            >
              Đăng nhập
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                variant="outlined"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>Tài khoản demo:</strong>
              <br />
              Tên đăng nhập: <strong>admin</strong>
              <br />
              Mật khẩu: <strong>admin123</strong>
            </Alert>
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Liên hệ quản trị viên nếu bạn quên mật khẩu
            </Typography>
          </CardContent>
        </Card>
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: 'white' }}
        >
          © 2024 School Bus Management System. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}

export default Login

