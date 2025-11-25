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
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../services/api'

const initialFormData = {
  name: '',
  studentCode: '',
  grade: '',
  className: '',
  parentName: '',
  parentPhone: '',
  address: '',
  latitude: '',
  longitude: '',
  status: 'active',
}

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await getStudents()
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      // Mock data for demo
      setStudents([
        {
          id: 1,
          name: 'Nguyễn Văn Nam',
          studentCode: 'HS001',
          grade: '5',
          className: '5A',
          parentName: 'Nguyễn Văn Cha',
          parentPhone: '0901234567',
          address: '123 Đường ABC, Hà Nội',
          latitude: 21.0285,
          longitude: 105.8542,
          status: 'Hoạt động',
        },
        {
          id: 2,
          name: 'Trần Thị Lan',
          studentCode: 'HS002',
          grade: '4',
          className: '4B',
          parentName: 'Trần Văn Cha',
          parentPhone: '0902345678',
          address: '456 Đường XYZ, Hà Nội',
          latitude: 21.0245,
          longitude: 105.8412,
          status: 'Hoạt động',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (student = null) => {
    if (student) {
      setFormData({
        name: student.name,
        studentCode: student.studentCode,
        grade: student.grade,
        className: student.className,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        address: student.address,
        latitude: student.latitude?.toString() || '',
        longitude: student.longitude?.toString() || '',
        status: student.status === 'Hoạt động' ? 'active' : 'inactive',
      })
      setEditingId(student.id)
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
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        status: formData.status === 'active' ? 'Hoạt động' : 'Ngừng đi xe',
      }

      if (editingId) {
        await updateStudent(editingId, dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Cập nhật học sinh thành công!',
          severity: 'success',
        })
      } else {
        await createStudent(dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Thêm học sinh thành công!',
          severity: 'success',
        })
      }
      fetchStudents()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving student:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteId)
      setSnackbar({
        open: true,
        message: 'Xóa học sinh thành công!',
        severity: 'success',
      })
      fetchStudents()
    } catch (error) {
      console.error('Error deleting student:', error)
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
    { id: 'studentCode', label: 'Mã HS' },
    { id: 'name', label: 'Họ và tên' },
    { id: 'className', label: 'Lớp' },
    { id: 'parentName', label: 'Phụ huynh' },
    { id: 'parentPhone', label: 'SĐT phụ huynh' },
    { id: 'address', label: 'Địa chỉ' },
    { id: 'status', label: 'Trạng thái', type: 'status' },
  ]

  if (loading) {
    return <Typography>Đang tải...</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Học sinh
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm học sinh
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={students}
        onEdit={handleOpenDialog}
        onDelete={(student) => {
          setDeleteId(student.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm học sinh..."
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã học sinh"
                value={formData.studentCode}
                onChange={(e) =>
                  setFormData({ ...formData, studentCode: e.target.value })
                }
                required
              />
            </Grid>
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
                label="Khối"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                required
              >
                {[1, 2, 3, 4, 5].map((grade) => (
                  <MenuItem key={grade} value={grade.toString()}>
                    Khối {grade}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lớp"
                value={formData.className}
                onChange={(e) =>
                  setFormData({ ...formData, className: e.target.value })
                }
                required
                placeholder="VD: 5A, 4B"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên phụ huynh"
                value={formData.parentName}
                onChange={(e) =>
                  setFormData({ ...formData, parentName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại phụ huynh"
                value={formData.parentPhone}
                onChange={(e) =>
                  setFormData({ ...formData, parentPhone: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ đón/trả"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vĩ độ (Latitude)"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                type="number"
                inputProps={{ step: 'any' }}
                helperText="Tọa độ vị trí đón/trả học sinh"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kinh độ (Longitude)"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                type="number"
                inputProps={{ step: 'any' }}
                helperText="Tọa độ vị trí đón/trả học sinh"
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
                <MenuItem value="inactive">Ngừng đi xe</MenuItem>
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
        message="Bạn có chắc chắn muốn xóa học sinh này?"
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

export default Students

