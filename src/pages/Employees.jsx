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
  Pagination,
  IconButton,
} from '@mui/material'
import { Add as AddIcon, PhotoCamera, FilterList } from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/api'

const initialFormData = {
  user_id: 1,
  full_name: '',
  cccd: '',
  phone: '',
  email: '',
  gender: 1,
  license_number: '',
  age: '',
  address: '',
  image_url: '',
  school_id: 1,
  status: 1,
  position: 1,
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

  // Pagination and filter states
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filters, setFilters] = useState({
    full_name__like: '',
    cccd__equal: '',
    phone__like: '',
    gender__equal: '',
    license_number__like: '',
    school_id__equal: '',
    status__equal: '',
    position__equal: '',
  })
  const [openFilterDialog, setOpenFilterDialog] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [page])

  const fetchEmployees = async () => {
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

      const response = await getEmployees(params)
      const employeesData = response.data.data || response.data

      // Set pagination metadata
      if (response.data.total !== undefined) {
        setTotalRecords(response.data.total)
        setTotalPages(response.data.last_page || 1)
      }

      // Map API fields to display format
      const mappedEmployees = employeesData.map(emp => ({
        id: emp.id,
        name: emp.full_name,
        phone: emp.phone,
        email: emp.email || '-',
        address: emp.address || '-',
        position: emp.position === 1 ? 'Tài xế' : 'Phụ xe',
        licenseNumber: emp.license_number || '',
        status: emp.status === 1 ? 'Hoạt động' : 'Ngừng hoạt động',
        age: emp.age,
        gender: emp.gender === 1 ? 'Nam' : 'Nữ',
        photo: emp.image_url || 'https://i.pravatar.cc/150',
        citizenId: emp.cccd || '',
        // Keep original fields for editing
        user_id: emp.user_id,
        full_name: emp.full_name,
        cccd: emp.cccd,
        image_url: emp.image_url,
        school_id: emp.school_id,
      }))

      setEmployees(mappedEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = async (employee = null) => {
    if (employee) {
      try {
        setLoading(true)
        // Fetch detailed employee information from API
        const response = await getEmployee(employee.id)
        const employeeDetail = response.data

        setFormData({
          user_id: employeeDetail.user_id || 1,
          full_name: employeeDetail.full_name,
          cccd: employeeDetail.cccd || '',
          phone: employeeDetail.phone,
          email: employeeDetail.email || '',
          gender: employeeDetail.gender,
          license_number: employeeDetail.license_number || '',
          age: employeeDetail.age?.toString() || '',
          address: employeeDetail.address || '',
          image_url: employeeDetail.image_url || '',
          school_id: employeeDetail.school_id || 1,
          status: employeeDetail.status,
          position: employeeDetail.position,
        })
        setPhotoPreview(employeeDetail.image_url || '')
        setEditingId(employeeDetail.id)
      } catch (error) {
        console.error('Error fetching employee details:', error)
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin nhân viên!',
          severity: 'error',
        })
        return
      } finally {
        setLoading(false)
      }
    } else {
      setFormData(initialFormData)
      setPhotoPreview('')
      setEditingId(null)
    }
    setOpenDialog(true)
  }

  const handleOpenViewDialog = async (employee) => {
    try {
      setLoading(true)
      // Fetch detailed employee information from API
      const response = await getEmployee(employee.id)
      const employeeDetail = response.data

      // Set the detailed employee data for viewing with display-friendly fields
      setViewingEmployee({
        ...employeeDetail,
        genderDisplay: employeeDetail.gender === 1 ? 'Nam' : 'Nữ',
        statusDisplay: employeeDetail.status === 1 ? 'Hoạt động' : 'Nghỉ việc',
        positionDisplay: employeeDetail.position === 1 ? 'Tài xế' : 'Phụ xe',
      })
      setOpenViewDialog(true)
    } catch (error) {
      console.error('Error fetching employee details:', error)
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin chi tiết nhân viên!',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
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
        setFormData({ ...formData, image_url: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.full_name || !formData.phone) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Số điện thoại)!',
          severity: 'warning',
        })
        return
      }

      const dataToSubmit = {
        full_name: formData.full_name.trim(),
        cccd: formData.cccd?.trim() || '',
        phone: formData.phone.trim(),
        email: formData.email?.trim() || '',
        gender: parseInt(formData.gender),
        license_number: formData.license_number?.trim() || '',
        age: parseInt(formData.age) || 0,
        address: formData.address?.trim() || '',
        image_url: formData.image_url?.trim() || '',
        status: parseInt(formData.status),
        position: parseInt(formData.position),
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
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        (editingId ? 'Không thể cập nhật nhân viên!' : 'Không thể thêm nhân viên!')
      setSnackbar({
        open: true,
        message: errorMessage,
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

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleApplyFilters = () => {
    setPage(1) // Reset to first page when applying filters
    fetchEmployees()
    setOpenFilterDialog(false)
  }

  const handleClearFilters = () => {
    setFilters({
      full_name__like: '',
      cccd__equal: '',
      phone__like: '',
      gender__equal: '',
      license_number__like: '',
      school_id__equal: '',
      status__equal: '',
      position__equal: '',
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
            Thêm nhân viên
          </Button>
        </Box>
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

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tổng số: {totalRecords} nhân viên
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
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số căn cước công dân"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
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
                    <MenuItem value={1}>Nam</MenuItem>
                    <MenuItem value={2}>Nữ</MenuItem>
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
                    <MenuItem value={1}>Tài xế</MenuItem>
                    <MenuItem value={2}>Phụ xe</MenuItem>
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
                    <MenuItem value={0}>Ngừng hoạt động</MenuItem>
                  </TextField>
                </Grid>
                {formData.position === 1 && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số giấy phép lái xe"
                      value={formData.license_number}
                      onChange={(e) =>
                        setFormData({ ...formData, license_number: e.target.value })
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
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết nhân viên</DialogTitle>
        <DialogContent>
          {viewingEmployee && (
            <Box sx={{ pt: 2 }}>
              {/* Ảnh đại diện */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={viewingEmployee.image_url}
                  sx={{ width: 150, height: 150 }}
                />
              </Box>

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
                    Họ và tên
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {viewingEmployee.full_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số căn cước
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.cccd || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Giới tính
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.genderDisplay}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tuổi
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.age} tuổi
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chức vụ
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.positionDisplay}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={viewingEmployee.statusDisplay}
                    color={viewingEmployee.status === 1 ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>

                {viewingEmployee.license_number && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số giấy phép lái xe
                    </Typography>
                    <Typography variant="body1">
                      {viewingEmployee.license_number}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.phone}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.email || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.address || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    Thông tin hệ thống
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.user_id}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    School ID
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.school_id}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.created_at ? new Date(viewingEmployee.created_at).toLocaleString('vi-VN') : '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày cập nhật
                  </Typography>
                  <Typography variant="body1">
                    {viewingEmployee.updated_at ? new Date(viewingEmployee.updated_at).toLocaleString('vi-VN') : '-'}
                  </Typography>
                </Grid>

                {viewingEmployee.deleted_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày xóa
                    </Typography>
                    <Typography variant="body1" color="error">
                      {new Date(viewingEmployee.deleted_at).toLocaleString('vi-VN')}
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
              handleOpenDialog(viewingEmployee)
            }}
            variant="contained"
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Lọc dữ liệu nhân viên</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên nhân viên"
                value={filters.full_name__like}
                onChange={(e) => setFilters({ ...filters, full_name__like: e.target.value })}
                placeholder="Tìm kiếm theo tên"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số CCCD"
                value={filters.cccd__equal}
                onChange={(e) => setFilters({ ...filters, cccd__equal: e.target.value })}
                placeholder="Nhập chính xác số CCCD"
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
                <MenuItem value={2}>Nữ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số giấy phép lái xe"
                value={filters.license_number__like}
                onChange={(e) => setFilters({ ...filters, license_number__like: e.target.value })}
                placeholder="Tìm kiếm theo GPLX"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Chức vụ"
                value={filters.position__equal}
                onChange={(e) => setFilters({ ...filters, position__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={1}>Tài xế</MenuItem>
                <MenuItem value={2}>Phụ xe</MenuItem>
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
                <MenuItem value={0}>Ngừng hoạt động</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="School ID"
                value={filters.school_id__equal}
                onChange={(e) => setFilters({ ...filters, school_id__equal: e.target.value })}
                placeholder="Nhập ID trường"
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

export default Employees

