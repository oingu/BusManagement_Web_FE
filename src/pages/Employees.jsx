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
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
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
}

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
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
      })
      setEditingId(employee.id)
    } else {
      setFormData(initialFormData)
      setEditingId(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData(initialFormData)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        position: formData.position === 'driver' ? 'Tài xế' : 'Phụ xe',
        status: formData.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động',
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
    { id: 'name', label: 'Họ và tên' },
    { id: 'position', label: 'Chức vụ' },
    { id: 'phone', label: 'Số điện thoại' },
    { id: 'email', label: 'Email' },
    { id: 'licenseNumber', label: 'Số GPLX' },
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
        onEdit={handleOpenDialog}
        onDelete={(employee) => {
          setDeleteId(employee.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm nhân viên..."
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
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
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              />
            </Grid>
            {formData.position === 'driver' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số giấy phép lái xe"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  required
                />
              </Grid>
            )}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
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

