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
  Pagination,
} from '@mui/material'
import { Add as AddIcon, Info as InfoIcon, Map as MapIcon, PhotoCamera, FilterList } from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import MapPicker from '../components/MapPicker'
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentParents,
} from '../services/api'

const initialFormData = {
  student_number: '',
  email: '',
  full_name: '',
  phone: '',
  gender: 1,
  dob: '',
  grade: '',
  address: '',
  student_parent_id: '',
  latitude: '',
  longitude: '',
  status: 1,
}

const Students = () => {
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
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

  // Pagination and filter states
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filters, setFilters] = useState({
    student_number__equal: '',
    student_number__like: '',
    email__like: '',
    full_name__like: '',
    phone__like: '',
    gender__equal: '',
    grade__equal: '',
    status__equal: '',
    address__like: '',
    student_parent_id__equal: '',
  })
  const [openFilterDialog, setOpenFilterDialog] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchParents()
  }, [page])

  const fetchParents = async () => {
    try {
      const response = await getStudentParents({})
      const parentsData = response.data.data || response.data
      setParents(parentsData)
    } catch (error) {
      console.error('Error fetching parents:', error)
      setParents([])
    }
  }

  const fetchStudents = async () => {
    try {
      setLoading(true)
      // Build query params
      const params = { page }

      // Add filters if they have values
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          params[key] = filters[key]
        }
      })

      const response = await getStudents(params)
      const studentsData = response.data.data || response.data

      // Set pagination metadata
      if (response.data.total !== undefined) {
        setTotalRecords(response.data.total)
        setTotalPages(response.data.last_page || 1)
      }

      // Map API fields to display format
      const mappedStudents = studentsData.map(student => ({
        id: student.id,
        studentCode: student.student_number,
        name: student.full_name,
        email: student.email || '-',
        phone: student.phone || '-',
        gender: student.gender === 1 ? 'Nam' : 'Nữ',
        dob: student.dob,
        grade: student.grade,
        className: `${student.grade}A`, // You might need to adjust this based on actual data
        address: student.address || '-',
        parentName: '-', // Will be populated if needed
        parentPhone: '-', // Will be populated if needed
        parentAccountId: student.student_parent_id,
        latitude: student.latitude,
        longitude: student.longitude,
        status: student.status === 1 ? 'Hoạt động' : 'Ngừng đi xe',
        photo: 'https://i.pravatar.cc/150', // Default photo
        // Keep original fields for editing
        student_number: student.student_number,
        full_name: student.full_name,
        student_parent_id: student.student_parent_id,
      }))

      setStudents(mappedStudents)
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (student = null) => {
    if (student) {
      // Use original API fields that were kept during mapping
      setFormData({
        student_number: student.student_number || '',
        email: student.email === '-' ? '' : (student.email || ''),
        full_name: student.full_name || student.name || '',
        phone: student.phone === '-' ? '' : (student.phone || ''),
        gender: student.gender === 'Nam' ? 1 : student.gender === 'Nữ' ? 0 : (student.gender || 1),
        dob: student.dob || '',
        grade: student.grade || '',
        address: student.address === '-' ? '' : (student.address || ''),
        student_parent_id: student.student_parent_id || '',
        latitude: student.latitude?.toString() || '',
        longitude: student.longitude?.toString() || '',
        status: student.status === 'Hoạt động' ? 1 : 0,
      })
      setEditingId(student.id)
    } else {
      setFormData(initialFormData)
    }
    setOpenDialog(true)
  }

  const handleOpenViewDialog = async (student) => {
    try {
      setLoading(true)
      // Fetch detailed student information from API
      const response = await getStudent(student.id)
      const studentDetail = response.data

      // Set the detailed student data for viewing
      setViewingStudent({
        ...studentDetail,
        // Add display-friendly fields
        genderDisplay: studentDetail.gender === 1 ? 'Nam' : 'Nữ',
        statusDisplay: studentDetail.status === 1 ? 'Hoạt động' : 'Ngừng đi xe',
      })
      setOpenViewDialog(true)
    } catch (error) {
      console.error('Error fetching student details:', error)
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin chi tiết học sinh!',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
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

  const handleLocationChange = (lat, lng) => {
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    })
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.student_number || !formData.full_name || !formData.grade) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Mã HS, Họ tên, Khối)',
          severity: 'warning',
        })
        return
      }

      const dataToSubmit = {
        student_number: formData.student_number.trim(),
        email: formData.email?.trim() || '',
        full_name: formData.full_name.trim(),
        phone: formData.phone?.trim() || '',
        gender: parseInt(formData.gender),
        dob: formData.dob || null,
        grade: parseInt(formData.grade),
        address: formData.address?.trim() || '',
        student_parent_id: formData.student_parent_id ? parseInt(formData.student_parent_id) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        status: parseInt(formData.status),
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
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        (editingId ? 'Không thể cập nhật học sinh!' : 'Không thể thêm học sinh!')
      setSnackbar({
        open: true,
        message: errorMessage,
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
      // Reset to page 1 if current page becomes empty after deletion
      if (students.length === 1 && page > 1) {
        setPage(page - 1)
      } else {
        fetchStudents()
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        'Không thể xóa học sinh. Vui lòng thử lại!'
      setSnackbar({
        open: true,
        message: errorMessage,
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

  const handleApplyFilters = () => {
    setPage(1)
    fetchStudents()
    setOpenFilterDialog(false)
  }

  const handleClearFilters = () => {
    setFilters({
      student_number__equal: '',
      student_number__like: '',
      email__like: '',
      full_name__like: '',
      phone__like: '',
      gender__equal: '',
      grade__equal: '',
      status__equal: '',
      address__like: '',
      student_parent_id__equal: '',
    })
    setPage(1)
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setOpenFilterDialog(true)}
          >
            Lọc dữ liệu
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm học sinh
          </Button>
        </Box>
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

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tổng số: {totalRecords} học sinh
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
                      value={formData.student_number}
                      onChange={(e) =>
                        setFormData({ ...formData, student_number: e.target.value })
                      }
                      required
                      placeholder="VD: SV20225107"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="VD: student@example.com"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="VD: 0987654321"
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
                      <MenuItem value={1}>Nam</MenuItem>
                      <MenuItem value={0}>Nữ</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      InputLabelProps={{ shrink: true }}
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
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          Khối {grade}
                        </MenuItem>
                      ))}
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
                      <MenuItem value={1}>Hoạt động</MenuItem>
                      <MenuItem value={0}>Ngừng đi xe</MenuItem>
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
                      label="Phụ huynh"
                      value={formData.student_parent_id}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          student_parent_id: e.target.value,
                        })
                      }}
                      helperText="Chọn phụ huynh từ danh sách (user_id sẽ được gửi tới API)"
                    >
                      <MenuItem value="">
                        <em>Chưa liên kết</em>
                      </MenuItem>
                      {parents.map((parent) => (
                        <MenuItem key={parent.id} value={parent.user_id}>
                          {parent.full_name} - {parent.phone_number} (User ID: {parent.user_id})
                        </MenuItem>
                      ))}
                    </TextField>
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
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Click trên bản đồ để chọn vị trí đón/trả học sinh chính xác
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
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết học sinh</DialogTitle>
        <DialogContent>
          {viewingStudent && (
            <Box sx={{ pt: 2 }}>
              {/* Thông tin chi tiết */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Thông tin cơ bản
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã học sinh
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewingStudent.student_number}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và tên
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewingStudent.full_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.email || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.phone || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giới tính
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.genderDisplay}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày sinh
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.dob || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Khối
                  </Typography>
                  <Typography variant="body1">
                    Khối {viewingStudent.grade}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={viewingStudent.statusDisplay}
                    color={viewingStudent.status === 1 ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.address || '-'}
                  </Typography>
                </Grid>

                {viewingStudent.student_parent_id && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID Phụ huynh
                    </Typography>
                    <Typography variant="body1">
                      {viewingStudent.student_parent_id}
                    </Typography>
                  </Grid>
                )}

                {(viewingStudent.latitude && viewingStudent.longitude) && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tọa độ (Vĩ độ, Kinh độ)
                    </Typography>
                    <Typography variant="body1">
                      {viewingStudent.latitude}, {viewingStudent.longitude}
                    </Typography>
                  </Grid>
                )}

                {/* QR Code Section */}
                {viewingStudent.qr_code_image_url && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                        Mã QR
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          boxShadow: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={viewingStudent.qr_code_image_url}
                          alt={`QR Code - ${viewingStudent.full_name}`}
                          style={{
                            width: 200,
                            height: 200,
                            objectFit: 'contain',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Mã học sinh: {viewingStudent.student_number}
                        </Typography>
                      </Box>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    Thông tin hệ thống
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.created_at ? new Date(viewingStudent.created_at).toLocaleString('vi-VN') : '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày cập nhật
                  </Typography>
                  <Typography variant="body1">
                    {viewingStudent.updated_at ? new Date(viewingStudent.updated_at).toLocaleString('vi-VN') : '-'}
                  </Typography>
                </Grid>

                {viewingStudent.deleted_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày xóa
                    </Typography>
                    <Typography variant="body1" color="error">
                      {new Date(viewingStudent.deleted_at).toLocaleString('vi-VN')}
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

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lọc dữ liệu học sinh</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã học sinh (chính xác)"
                value={filters.student_number__equal}
                onChange={(e) => setFilters({ ...filters, student_number__equal: e.target.value })}
                placeholder="VD: SV515126"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã học sinh (tìm kiếm)"
                value={filters.student_number__like}
                onChange={(e) => setFilters({ ...filters, student_number__like: e.target.value })}
                placeholder="VD: SV5151"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={filters.email__like}
                onChange={(e) => setFilters({ ...filters, email__like: e.target.value })}
                placeholder="Tìm kiếm theo email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên học sinh"
                value={filters.full_name__like}
                onChange={(e) => setFilters({ ...filters, full_name__like: e.target.value })}
                placeholder="Tìm kiếm theo tên"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={filters.phone__like}
                onChange={(e) => setFilters({ ...filters, phone__like: e.target.value })}
                placeholder="Tìm kiếm theo SĐT"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Giới tính"
                value={filters.gender__equal}
                onChange={(e) => setFilters({ ...filters, gender__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={1}>Nam</MenuItem>
                <MenuItem value={0}>Nữ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Khối"
                value={filters.grade__equal}
                onChange={(e) => setFilters({ ...filters, grade__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                  <MenuItem key={grade} value={grade}>Khối {grade}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={filters.status__equal}
                onChange={(e) => setFilters({ ...filters, status__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={1}>Hoạt động</MenuItem>
                <MenuItem value={0}>Ngừng đi xe</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={filters.address__like}
                onChange={(e) => setFilters({ ...filters, address__like: e.target.value })}
                placeholder="Tìm kiếm theo địa chỉ"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="ID Phụ huynh"
                value={filters.student_parent_id__equal}
                onChange={(e) => setFilters({ ...filters, student_parent_id__equal: e.target.value })}
                placeholder="Nhập ID phụ huynh"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearFilters}>Xóa bộ lọc</Button>
          <Button onClick={() => setOpenFilterDialog(false)}>Hủy</Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Áp dụng
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

export default Students

