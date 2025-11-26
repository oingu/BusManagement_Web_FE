import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  Divider,
  Stack,
} from '@mui/material'
import { Add as AddIcon, PhotoCamera } from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/api'

const initialFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  position: 'driver',
  licenseNumber: '',
  status: 'active',
  age: '',
  yearsOfExperience: '',
  gender: 'male',
  photo: '',
  citizenId: '',
}

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [viewingEmployee, setViewingEmployee] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees()
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Mock data for demo
      setEmployees([
        {
          id: 1,
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          email: 'nguyenvana@example.com',
          address: 'Hà Nội',
          position: 'Tài xế',
          licenseNumber: 'B2-123456',
          status: 'Hoạt động',
          age: 35,
          yearsOfExperience: 10,
          gender: 'Nam',
          photo: 'https://i.pravatar.cc/150?img=12',
          citizenId: '001234567890',
        },
        {
          id: 2,
          name: 'Trần Thị B',
          phone: '0987654321',
          email: 'tranthib@example.com',
          address: 'Hà Nội',
          position: 'Phụ xe',
          licenseNumber: '',
          status: 'Hoạt động',
          age: 28,
          yearsOfExperience: 5,
          gender: 'Nữ',
          photo: 'https://i.pravatar.cc/150?img=25',
          citizenId: '001987654321',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setFormData({
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
        address: employee.address,
        position: employee.position === 'Tài xế' ? 'driver' : 'attendant',
        licenseNumber: employee.licenseNumber || '',
        status: employee.status === 'Hoạt động' ? 'active' : 'inactive',
        age: employee.age || '',
        yearsOfExperience: employee.yearsOfExperience || '',
        gender: employee.gender === 'Nam' ? 'male' : 'female',
        photo: employee.photo || '',
        citizenId: employee.citizenId || '',
      })
      setPhotoPreview(employee.photo || '')
      setEditingId(employee.id)
    } else {
      setFormData(initialFormData)
      setPhotoPreview('')
      setEditingId(null)
    }
    setOpenDialog(true)
  }

  const handleOpenViewDialog = (employee) => {
    setViewingEmployee(employee)
    setOpenViewDialog(true)
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setViewingEmployee(null)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData(initialFormData)
    setPhotoPreview('')
    setEditingId(null)
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
        setFormData({ ...formData, photo: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        position: formData.position === 'driver' ? 'Tài xế' : 'Phụ xe',
        status: formData.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động',
        gender: formData.gender === 'male' ? 'Nam' : 'Nữ',
        age: parseInt(formData.age) || 0,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
      }

      if (editingId) {
        await updateEmployee(editingId, dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Cập nhật nhân viên thành công!',
          severity: 'success',
        })
      } else {
        await createEmployee(dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Thêm nhân viên thành công!',
          severity: 'success',
        })
      }
      fetchEmployees()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving employee:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteId)
      setSnackbar({
        open: true,
        message: 'Xóa nhân viên thành công!',
        severity: 'success',
      })
      fetchEmployees()
    } catch (error) {
      console.error('Error deleting employee:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    } finally {
      setOpenConfirm(false)
      setDeleteId(null)
    }
  }

  const columns = [
    { 
      id: 'photo', 
      label: 'Ảnh',
      render: (value) => (
        <Avatar 
          src={value} 
          alt="Employee"
          sx={{ width: 40, height: 40 }}
        />
      )
    },
    { id: 'name', label: 'Họ và tên' },
    { id: 'position', label: 'Chức vụ' },
    { id: 'phone', label: 'Số điện thoại' },
    { id: 'gender', label: 'Giới tính' },
    { id: 'status', label: 'Trạng thái', type: 'status' },
  ]

  if (loading) {
    return <Typography>Đang tải...</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Nhân viên
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm nhân viên
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={employees}
        onView={handleOpenViewDialog}
        onEdit={handleOpenDialog}
        onDelete={(employee) => {
          setDeleteId(employee.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm nhân viên..."
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Ảnh đại diện */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pb: 2 }}>
              <Avatar 
                src={photoPreview} 
                sx={{ width: 120, height: 120, border: '3px solid #e0e0e0' }}
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                size="medium"
              >
                Chọn ảnh đại diện
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
            </Box>

            <Divider />

            {/* Thông tin cá nhân */}
            <Box>
              <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                Thông tin cá nhân
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số căn cước công dân"
                    value={formData.citizenId}
                    onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                    required
                    placeholder="VD: 001234567890"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Giới tính"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tuổi"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                    inputProps={{ min: 18, max: 65 }}
                    placeholder="18-65"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số năm kinh nghiệm"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    required
                    inputProps={{ min: 0, max: 50 }}
                    placeholder="Số năm"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Thông tin công việc */}
            <Box>
              <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                Thông tin công việc
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Chức vụ"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  >
                    <MenuItem value="driver">Tài xế</MenuItem>
                    <MenuItem value="attendant">Phụ xe</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Trạng thái"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Hoạt động</MenuItem>
                    <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
                  </TextField>
                </Grid>
                {formData.position === 'driver' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số giấy phép lái xe"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, licenseNumber: e.target.value })
                      }
                      required
                      placeholder="VD: B2-123456"
                    />
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Thông tin liên hệ */}
            <Box>
              <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                Thông tin liên hệ
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="VD: 0901234567"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="Nhập địa chỉ chi tiết"
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" size="large">
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" size="large">
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa nhân viên này?"
        onConfirm={handleDelete}
        onCancel={() => {
          setOpenConfirm(false)
          setDeleteId(null)
        }}
        confirmText="Xóa"
        confirmColor="error"
      />

      {/* Dialog xem chi tiết */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết nhân viên</DialogTitle>
        <DialogContent>
          {viewingEmployee && (
            <Box sx={{ pt: 2 }}>
              {/* Ảnh đại diện */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar 
                  src={viewingEmployee.photo} 
                  sx={{ width: 150, height: 150 }}
                />
              </Box>

              {/* Thông tin chi tiết */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewingEmployee.name}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số căn cước
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.citizenId}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giới tính
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.gender}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tuổi
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.age} tuổi
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kinh nghiệm
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.yearsOfExperience} năm
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chức vụ
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.position}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip 
                    label={viewingEmployee.status} 
                    color={viewingEmployee.status === 'Hoạt động' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>

                {viewingEmployee.licenseNumber && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số giấy phép lái xe
                    </Typography>
                    <Typography variant="body1">
                      {viewingEmployee.licenseNumber}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.phone}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.email}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.address}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog()
              handleOpenDialog(viewingEmployee)
            }} 
            variant="contained"
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Employees

