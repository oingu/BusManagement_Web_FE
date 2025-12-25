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
  Tabs,
  Tab,
  Avatar,
  Chip,
  Divider,
  Stack,
} from '@mui/material'
import { Add as AddIcon, Info as InfoIcon, Map as MapIcon, PhotoCamera } from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import MapPicker from '../components/MapPicker'
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getParentAccounts,
  getBusStops,
} from '../services/api'

const initialFormData = {
  name: '',
  studentCode: '',
  grade: '',
  className: '',
  parentName: '',
  parentPhone: '',
  parentAccountId: '',
  busStopId: '',
  address: '',
  latitude: '',
  longitude: '',
  status: 'active',
  photo: '',
}

const Students = () => {
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
  const [busStops, setBusStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [viewingStudent, setViewingStudent] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchStudents()
    fetchParents()
    fetchBusStops()
  }, [])

  const fetchParents = async () => {
    try {
      const response = await getParentAccounts()
      setParents(response.data)
    } catch (error) {
      console.error('Error fetching parents:', error)
      // Mock data for demo
      setParents([
        {
          id: 1,
          username: 'phuhuynhnguyen',
          relatedName: 'Nguyễn Văn Cha',
          relatedPhone: '0901234567',
        },
        {
          id: 2,
          username: 'phuhuynh.tran',
          relatedName: 'Trần Văn Cha',
          relatedPhone: '0902345678',
        },
      ])
    }
  }

  const fetchBusStops = async () => {
    const mockData = [
      { id: 1, name: 'Ngã tư Lê Văn Lương', latitude: 21.0285, longitude: 105.8542, address: 'Số 123 Lê Văn Lương, Thanh Xuân, Hà Nội', status: 'Hoạt động' },
      { id: 2, name: 'Ngã tư Trung Hòa - Nhân Chính', latitude: 21.0055, longitude: 105.8136, address: 'Ngã tư Trung Hòa - Nhân Chính, Cầu Giấy, Hà Nội', status: 'Hoạt động' },
      { id: 3, name: 'Bến xe Mỹ Đình', latitude: 21.0277, longitude: 105.7800, address: 'Bến xe Mỹ Đình, Nam Từ Liêm, Hà Nội', status: 'Hoạt động' },
    ]
    try {
      const response = await getBusStops()
      setBusStops(response.data && response.data.length > 0 ? response.data.filter(s => s.status === 'Hoạt động') : mockData)
    } catch (error) {
      console.error('Error fetching bus stops:', error)
      setBusStops(mockData)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await getStudents()
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      // Mock data for demo - import from mockRoutingData
      const { MOCK_STUDENTS_WITH_LOCATION } = await import('../services/mockRoutingData')
      setStudents(MOCK_STUDENTS_WITH_LOCATION)
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
        parentAccountId: student.parentAccountId?.toString() || '',
        busStopId: student.busStopId?.toString() || '',
        address: student.address,
        latitude: student.latitude?.toString() || '',
        longitude: student.longitude?.toString() || '',
        status: student.status === 'Hoạt động' ? 'active' : 'inactive',
        photo: student.photo || '',
      })
      setPhotoPreview(student.photo || '')
      setEditingId(student.id)
    } else {
      setFormData(initialFormData)
      setPhotoPreview('')
      setEditingId(null)
    }
    setOpenDialog(true)
  }

  const handleOpenViewDialog = (student) => {
    setViewingStudent(student)
    setOpenViewDialog(true)
  }

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false)
    setViewingStudent(null)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setFormData(initialFormData)
    setPhotoPreview('')
    setEditingId(null)
    setTabValue(0)
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

  const handleBusStopChange = (event) => {
    const selectedId = event.target.value
    const selectedStop = busStops.find(stop => stop.id.toString() === selectedId)
    if (selectedStop) {
      setFormData({
        ...formData,
        busStopId: selectedId,
        address: selectedStop.address,
        latitude: selectedStop.latitude.toString(),
        longitude: selectedStop.longitude.toString(),
      })
    } else {
      setFormData({ ...formData, busStopId: '' })
    }
  }

  const handleLocationChange = (lat, lng) => {
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    })
  }

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        busStopId: formData.busStopId ? parseInt(formData.busStopId) : null,
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
    {
      id: 'photo',
      label: 'Ảnh',
      render: (value) => (
        <Avatar
          src={value}
          alt="Student"
          sx={{ width: 40, height: 40 }}
        />
      )
    },
    { id: 'studentCode', label: 'Mã HS' },
    { id: 'name', label: 'Họ và tên' },
    { id: 'className', label: 'Lớp' },
    { id: 'parentName', label: 'Phụ huynh' },
    { id: 'parentPhone', label: 'SĐT phụ huynh' },
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
        onView={handleOpenViewDialog}
        onEdit={handleOpenDialog}
        onDelete={(student) => {
          setDeleteId(student.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm học sinh..."
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {editingId ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
          </Typography>
        </DialogTitle>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<InfoIcon />} iconPosition="start" label="Thông tin cơ bản" />
          <Tab icon={<MapIcon />} iconPosition="start" label="Vị trí trên bản đồ" />
        </Tabs>
        <DialogContent sx={{ pt: 3 }}>
          {tabValue === 0 && (
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

              {/* Thông tin học sinh */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                  Thông tin học sinh
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mã học sinh"
                      value={formData.studentCode}
                      onChange={(e) =>
                        setFormData({ ...formData, studentCode: e.target.value })
                      }
                      required
                      placeholder="VD: HS001"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12}>
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
              </Box>

              <Divider />

              {/* Thông tin phụ huynh */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                  Thông tin phụ huynh
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Tài khoản phụ huynh"
                      value={formData.parentAccountId}
                      onChange={(e) => {
                        const selectedParent = parents.find(p => p.id.toString() === e.target.value)
                        setFormData({
                          ...formData,
                          parentAccountId: e.target.value,
                          parentName: selectedParent?.relatedName || '',
                          parentPhone: selectedParent?.relatedPhone || '',
                        })
                      }}
                      helperText="Liên kết với tài khoản phụ huynh trên ứng dụng mobile"
                    >
                      <MenuItem value="">
                        <em>Chưa liên kết</em>
                      </MenuItem>
                      {parents.map((parent) => (
                        <MenuItem key={parent.id} value={parent.id.toString()}>
                          {parent.relatedName} - {parent.relatedPhone} ({parent.username})
                        </MenuItem>
                      ))}
                    </TextField>
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
                      placeholder="Nhập tên phụ huynh"
                      helperText="Tự động điền khi chọn tài khoản"
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
                      placeholder="VD: 0901234567"
                      helperText="Tự động điền khi chọn tài khoản"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Địa chỉ và tọa độ */}
              <Box>
                <Typography variant="subtitle1" fontWeight="600" color="primary" gutterBottom>
                  Địa chỉ đón/trả
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      multiline
                      rows={2}
                      required
                      placeholder="Nhập địa chỉ chi tiết để đón/trả học sinh"
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
                      placeholder="VD: 21.0285"
                      helperText="Hoặc chọn trên bản đồ ở tab bên cạnh"
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
                      placeholder="VD: 105.8542"
                      helperText="Hoặc chọn trên bản đồ ở tab bên cạnh"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}

          {tabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Chọn điểm dừng có sẵn"
                value={formData.busStopId}
                onChange={handleBusStopChange}
                sx={{ mb: 3 }}
                helperText="Chọn điểm dừng sẽ tự động điền tọa độ và địa chỉ vào bản đồ"
              >
                <MenuItem value="">
                  <em>Không chọn - Click trên bản đồ để chọn vị trí tùy chỉnh</em>
                </MenuItem>
                {busStops.map((stop) => (
                  <MenuItem key={stop.id} value={stop.id.toString()}>
                    {stop.name} - {stop.address}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Hoặc click trực tiếp trên bản đồ để chọn vị trí đón/trả học sinh
              </Typography>
              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
                address={formData.address}
              />
            </Box>
          )}
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

      {/* Dialog xem chi tiết */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết học sinh</DialogTitle>
        <DialogContent>
          {viewingStudent && (
            <Box sx={{ pt: 2 }}>
              {/* Ảnh đại diện */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={viewingStudent.photo}
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
                    {viewingStudent.name}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã học sinh
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.studentCode}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lớp
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.className}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khối
                  </Typography>
                  <Typography variant="body1">
                    Khối {viewingStudent.grade}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={viewingStudent.status}
                    color={viewingStudent.status === 'Hoạt động' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tên phụ huynh
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.parentName}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại phụ huynh
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.parentPhone}
                  </Typography>
                </Grid>

                {viewingStudent.parentAccountName && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tài khoản phụ huynh
                    </Typography>
                    <Typography variant="body1">
                      {viewingStudent.parentAccountName}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ đón/trả
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.address}
                  </Typography>
                </Grid>

                {viewingStudent.latitude && viewingStudent.longitude && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tọa độ
                    </Typography>
                    <Typography variant="body1">
                      {viewingStudent.latitude}, {viewingStudent.longitude}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Đóng</Button>
          <Button
            onClick={() => {
              handleCloseViewDialog()
              handleOpenDialog(viewingStudent)
            }}
            variant="contained"
          >
            Chỉnh sửa
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

