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
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../services/api'

const initialFormData = {
  licensePlate: '',
  vehicleType: 'bus',
  capacity: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  status: 'active',
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await getVehicles()
      setVehicles(response.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      // Mock data for demo
      setVehicles([
        {
          id: 1,
          licensePlate: '29B-12345',
          vehicleType: 'Xe Bus',
          capacity: 30,
          brand: 'Hyundai',
          model: 'County',
          year: 2022,
          color: 'Vàng',
          status: 'Hoạt động',
        },
        {
          id: 2,
          licensePlate: '30A-67890',
          vehicleType: 'Xe Bus',
          capacity: 25,
          brand: 'Toyota',
          model: 'Coaster',
          year: 2021,
          color: 'Trắng',
          status: 'Hoạt động',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (vehicle = null) => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType === 'Xe Bus' ? 'bus' : 'van',
        capacity: vehicle.capacity.toString(),
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year.toString(),
        color: vehicle.color,
        status: vehicle.status === 'Hoạt động' ? 'active' : 'inactive',
      })
      setEditingId(vehicle.id)
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
        vehicleType: formData.vehicleType === 'bus' ? 'Xe Bus' : 'Xe Van',
        capacity: parseInt(formData.capacity),
        year: parseInt(formData.year),
        status: formData.status === 'active' ? 'Hoạt động' : 'Bảo trì',
      }

      if (editingId) {
        await updateVehicle(editingId, dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Cập nhật phương tiện thành công!',
          severity: 'success',
        })
      } else {
        await createVehicle(dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Thêm phương tiện thành công!',
          severity: 'success',
        })
      }
      fetchVehicles()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteVehicle(deleteId)
      setSnackbar({
        open: true,
        message: 'Xóa phương tiện thành công!',
        severity: 'success',
      })
      fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
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
    { id: 'licensePlate', label: 'Biển số xe' },
    { id: 'vehicleType', label: 'Loại xe' },
    { id: 'capacity', label: 'Số chỗ' },
    { id: 'brand', label: 'Hãng xe' },
    { id: 'model', label: 'Model' },
    { id: 'year', label: 'Năm SX' },
    { id: 'color', label: 'Màu sắc' },
    { id: 'status', label: 'Trạng thái', type: 'status' },
  ]

  if (loading) {
    return <Typography>Đang tải...</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Phương tiện
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm phương tiện
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={vehicles}
        onEdit={handleOpenDialog}
        onDelete={(vehicle) => {
          setDeleteId(vehicle.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm phương tiện..."
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Biển số xe"
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                required
                placeholder="VD: 29B-12345"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loại xe"
                value={formData.vehicleType}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleType: e.target.value })
                }
                required
              >
                <MenuItem value="bus">Xe Bus</MenuItem>
                <MenuItem value="van">Xe Van</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số chỗ ngồi"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hãng xe"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                placeholder="VD: Hyundai, Toyota"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
                placeholder="VD: County, Coaster"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm sản xuất"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                type="number"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Màu sắc"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
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
                <MenuItem value="inactive">Bảo trì</MenuItem>
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
        message="Bạn có chắc chắn muốn xóa phương tiện này?"
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

export default Vehicles

