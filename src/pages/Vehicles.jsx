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
  Pagination,
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
  plate_number: '',
  type: 1,
  capacity: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  status: 1,
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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    fetchVehicles()
  }, [page])


  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await getVehicles({ page })
      // API returns paginated data: { data: [...], total, last_page, current_page, ... }
      const responseData = response.data
      const vehiclesData = responseData.data || responseData

      // Set pagination metadata
      if (responseData.total !== undefined) {
        setTotalRecords(responseData.total)
        setTotalPages(responseData.last_page || 1)
      }

      // Map API fields to display format
      const mappedVehicles = vehiclesData.map(vehicle => ({
        id: vehicle.id,
        licensePlate: vehicle.plate_number,
        vehicleType: vehicle.type === 1 ? 'Xe Bus' : vehicle.type === 2 ? 'Xe Van' : 'Chưa xác định',
        capacity: vehicle.capacity,
        brand: vehicle.brand || '-',
        model: vehicle.model || '-',
        year: vehicle.year,
        color: vehicle.color || '-',
        status: vehicle.status === 1 ? 'Hoạt động' : 'Bảo trì',
        // Keep original fields for editing
        plate_number: vehicle.plate_number,
        type: vehicle.type,
      }))

      setVehicles(mappedVehicles)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }


  const handleOpenDialog = (vehicle = null) => {
    if (vehicle) {
      setFormData({
        plate_number: vehicle.plate_number || vehicle.licensePlate,
        type: vehicle.type !== null && vehicle.type !== undefined
          ? vehicle.type
          : (vehicle.vehicleType === 'Xe Bus' ? 1 : vehicle.vehicleType === 'Xe Van' ? 2 : 1),
        capacity: vehicle.capacity?.toString() || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        status: vehicle.status === 'Hoạt động' || vehicle.status === 1 ? 1 : 0,
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
        type: parseInt(formData.type),
        plate_number: formData.plate_number.trim(),
        capacity: parseInt(formData.capacity),
        year: parseInt(formData.year),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        color: formData.color.trim(),
        status: parseInt(formData.status),
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
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        (editingId ? 'Không thể cập nhật phương tiện!' : 'Không thể thêm phương tiện!')
      setSnackbar({
        open: true,
        message: errorMessage,
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
      fetchVehicles(page + 1, rowsPerPage)
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

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const columns = [
    { id: 'licensePlate', label: 'Biển số xe' },
    { id: 'vehicleType', label: 'Loại xe' },
    { id: 'capacity', label: 'Sức chứa' },
    { id: 'brand', label: 'Hãng xe' },
    { id: 'model', label: 'Dòng xe' },
    { id: 'year', label: 'Năm sản xuất' },
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

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tổng số: {totalRecords} phương tiện
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

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
                value={formData.plate_number}
                onChange={(e) =>
                  setFormData({ ...formData, plate_number: e.target.value })
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
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <MenuItem value={1}>Xe Bus</MenuItem>
                <MenuItem value={2}>Xe Van</MenuItem>
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
                <MenuItem value={1}>Hoạt động</MenuItem>
                <MenuItem value={0}>Bảo trì</MenuItem>
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

