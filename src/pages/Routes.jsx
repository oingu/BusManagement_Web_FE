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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  Tabs,
  Tab,
  Pagination,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  List as ListIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  FilterList,
  LocationOn as LocationIcon,
} from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import RouteMap from '../components/RouteMap'
import TripRouteMap from '../components/TripRouteMap'
import RoutePointAssigner from '../components/RoutePointAssigner'
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getStudents,
  getAllVehicles,
  getAllDrivers,
  assignStudentsToRoute,
} from '../services/api'

const initialFormData = {
  name: '',
  driver_id: '',
  assistant_id: '',
  vehicle_id: '',
  total_students: 0,
  curr_students: 0,
  type: 0,
  status: 0,
  start_time: '07:00',
  end_time: '08:30',
  is_mon: true,
  is_tue: true,
  is_wed: true,
  is_thu: true,
  is_fri: true,
  is_sat: false,
}

const Routes = () => {
  const [routes, setRoutes] = useState([])
  const [students, setStudents] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [attendants, setAttendants] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openMapDialog, setOpenMapDialog] = useState(false)
  const [openViewRouteDialog, setOpenViewRouteDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openFilterDialog, setOpenFilterDialog] = useState(false)
  const [openPointAssigner, setOpenPointAssigner] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [tabValue, setTabValue] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filters, setFilters] = useState({
    name__like: '',
    driver_id__equal: '',
    assistant_id__equal: '',
    vehicle_id__equal: '',
    type__equal: '',
    status__equal: '',
    total_students__equal: '',
    start_time__from: '',
    start_time__to: '',
  })

  useEffect(() => {
    fetchData()
  }, [page, filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Build query params for routes
      const routeParams = { page }
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          routeParams[key] = filters[key]
        }
      })

      const [routesRes, studentsRes, vehiclesRes, driversRes] = await Promise.all([
        getRoutes(routeParams),
        getStudents({}),
        getAllVehicles(),
        getAllDrivers(),
      ])

      // Handle routes response
      const routesData = routesRes.data.data || routesRes.data
      if (routesRes.data.total !== undefined) {
        setTotalRecords(routesRes.data.total)
        setTotalPages(routesRes.data.last_page || 1)
      }

      // Map routes data to display format
      const mappedRoutes = routesData.map(route => ({
        id: route.id,
        name: route.name,
        vehicle: route.vehicle?.plate_number || '-',
        driver: route.driver?.full_name || '-',
        attendant: route.assistant?.full_name || '-',
        routeType: route.type === 0 ? 'Đón sáng' : 'Trả chiều',
        startTime: route.start_time ? new Date(route.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
        endTime: route.end_time ? new Date(route.end_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-',
        studentCount: route.curr_students || 0,
        totalStudents: route.total_students || 0,
        status: route.status === 1 ? 'Hoạt động' : route.status === 0 ? 'Chưa bắt đầu' : 'Đã hoàn thành',
        // Keep original fields
        driver_id: route.driver_id,
        assistant_id: route.assistant_id,
        vehicle_id: route.vehicle_id,
        type: route.type,
      }))

      setRoutes(mappedRoutes)

      // Handle students response
      const studentsData = studentsRes.data.data || studentsRes.data
      setStudents(studentsData)

      // Handle vehicles response - using /vehicles/all
      const vehiclesData = vehiclesRes.data.data || vehiclesRes.data || []
      console.log('All vehicles:', vehiclesData)
      setVehicles(vehiclesData)

      // Handle drivers response - using /drivers/all
      const allDriversData = driversRes.data.data || driversRes.data || []
      console.log('All drivers/attendants:', allDriversData)

      // Separate drivers (position=1) and attendants (position=2)
      const driversFiltered = allDriversData.filter(e => e.position === 1)
      const attendantsFiltered = allDriversData.filter(e => e.position === 2)

      console.log('Drivers (position === 1):', driversFiltered)
      console.log('Attendants (position === 2):', attendantsFiltered)

      setDrivers(driversFiltered)
      setAttendants(attendantsFiltered)
    } catch (error) {
      console.error('Error fetching data:', error)
      setRoutes([])
      setStudents([])
      setVehicles([])
      setDrivers([])
      setAttendants([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (route = null) => {
    if (route) {
      setFormData({
        name: route.name,
        driver_id: route.driver_id || '',
        assistant_id: route.assistant_id || '',
        vehicle_id: route.vehicle_id || '',
        total_students: route.totalStudents || 0,
        curr_students: route.studentCount || 0,
        type: route.type,
        status: route.status === 'Hoạt động' ? 1 : route.status === 'Chưa bắt đầu' ? 0 : 2,
        start_time: route.start_time || '07:00',
        end_time: route.end_time || '08:30',
        is_mon: route.is_mon ?? true,
        is_tue: route.is_tue ?? true,
        is_wed: route.is_wed ?? true,
        is_thu: route.is_thu ?? true,
        is_fri: route.is_fri ?? true,
        is_sat: route.is_sat ?? false,
      })
      setEditingId(route.id)
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
      // Validate required fields
      if (!formData.name || !formData.driver_id || !formData.assistant_id || !formData.vehicle_id) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
          severity: 'warning',
        })
        return
      }

      const dataToSubmit = {
        name: formData.name.trim(),
        driver_id: parseInt(formData.driver_id),
        assistant_id: parseInt(formData.assistant_id),
        vehicle_id: parseInt(formData.vehicle_id),
        total_students: parseInt(formData.total_students) || 0,
        curr_students: parseInt(formData.curr_students) || 0,
        type: parseInt(formData.type),
        status: parseInt(formData.status),
        start_time: formData.start_time || '07:00', // Format: "HH:mm"
        end_time: formData.end_time || '08:30', // Format: "HH:mm"
        is_mon: formData.is_mon || false,
        is_tue: formData.is_tue || false,
        is_wed: formData.is_wed || false,
        is_thu: formData.is_thu || false,
        is_fri: formData.is_fri || false,
        is_sat: formData.is_sat || false,
      }

      if (editingId) {
        await updateRoute(editingId, dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Cập nhật lộ trình thành công!',
          severity: 'success',
        })
      } else {
        await createRoute(dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Thêm lộ trình thành công!',
          severity: 'success',
        })
      }
      fetchData()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving route:', error)
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        (editingId ? 'Không thể cập nhật lộ trình!' : 'Không thể thêm lộ trình!')
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRoute(deleteId)
      setSnackbar({
        open: true,
        message: 'Xóa lộ trình thành công!',
        severity: 'success',
      })
      fetchData()
    } catch (error) {
      console.error('Error deleting route:', error)
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

  const handleOpenMapDialog = (route) => {
    setSelectedRoute(route)
    // Load students for this route
    // For demo, we'll use all students
    setSelectedStudents(route.students || [])
    setOpenMapDialog(true)
  }

  const handleStudentClick = (student) => {
    const isSelected = selectedStudents.some(s => s.id === student.id)

    if (isSelected) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))
    } else {
      setSelectedStudents([...selectedStudents, student])
    }
  }

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId))
  }

  const handleMoveStudentUp = (index) => {
    if (index === 0) return
    const newStudents = [...selectedStudents]
    const temp = newStudents[index]
    newStudents[index] = newStudents[index - 1]
    newStudents[index - 1] = temp
    setSelectedStudents(newStudents)
  }

  const handleMoveStudentDown = (index) => {
    if (index === selectedStudents.length - 1) return
    const newStudents = [...selectedStudents]
    const temp = newStudents[index]
    newStudents[index] = newStudents[index + 1]
    newStudents[index + 1] = temp
    setSelectedStudents(newStudents)
  }

  const handleSaveRouteStudents = async () => {
    try {
      const studentIds = selectedStudents.map(s => s.id)
      await assignStudentsToRoute(selectedRoute.id, studentIds)

      setSnackbar({
        open: true,
        message: 'Lưu danh sách học sinh thành công!',
        severity: 'success',
      })
      setOpenMapDialog(false)
      fetchData()
    } catch (error) {
      console.error('Error saving route students:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  const handleApplyFilters = () => {
    setPage(1) // Reset to first page when applying filters
    setOpenFilterDialog(false)
  }

  const handleClearFilters = () => {
    setFilters({
      name__like: '',
      driver_id__equal: '',
      assistant_id__equal: '',
      vehicle_id__equal: '',
      type__equal: '',
      status__equal: '',
      total_students__equal: '',
      start_time__from: '',
      start_time__to: '',
    })
    setPage(1)
    setOpenFilterDialog(false)
  }

  const columns = [
    { id: 'name', label: 'Tên lộ trình' },
    { id: 'vehicle', label: 'Biển số xe' },
    { id: 'driver', label: 'Tài xế' },
    { id: 'attendant', label: 'Phụ xe' },
    { id: 'routeType', label: 'Loại' },
    { id: 'startTime', label: 'Giờ bắt đầu' },
    { id: 'studentCount', label: 'Số HS', render: (value) => value || 0 },
    { id: 'status', label: 'Trạng thái', type: 'status' },
    {
      id: 'map',
      label: 'Lộ trình',
      render: (value, row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedRoute(row)
            setOpenViewRouteDialog(true)
          }}
        >
          Xem
        </Button>
      ),
    },
    {
      id: 'assignPoints',
      label: 'Gán điểm dừng',
      render: (value, row) => (
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<LocationIcon />}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedRoute(row)
            setOpenPointAssigner(true)
          }}
        >
          Gán
        </Button>
      ),
    },
  ]

  if (loading) {
    return <Typography>Đang tải...</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Lộ trình
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
            Thêm lộ trình
          </Button>
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={routes}
        onEdit={handleOpenDialog}
        onDelete={(route) => {
          setDeleteId(route.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm lộ trình..."
      />

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Tổng số: {totalRecords} lộ trình
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

      {/* Add/Edit Route Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa lộ trình' : 'Thêm lộ trình mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên lộ trình"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="VD: Lộ trình đón buổi sáng"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phương tiện"
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                required
              >
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} ({vehicle.capacity} chỗ)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loại lộ trình"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <MenuItem value={0}>Đón sáng</MenuItem>
                <MenuItem value={1}>Trả chiều</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tài xế"
                value={formData.driver_id}
                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                required
                helperText={drivers.length === 0 ? 'Không có tài xế nào. Vui lòng thêm nhân viên với vị trí "Tài xế"' : ''}
              >
                {drivers.length === 0 ? (
                  <MenuItem disabled value="">
                    Không có tài xế
                  </MenuItem>
                ) : (
                  drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.full_name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phụ xe"
                value={formData.assistant_id}
                onChange={(e) =>
                  setFormData({ ...formData, assistant_id: e.target.value })
                }
                required
                helperText={attendants.length === 0 ? 'Không có phụ xe nào. Vui lòng thêm nhân viên với vị trí "Phụ xe"' : ''}
              >
                {attendants.length === 0 ? (
                  <MenuItem disabled value="">
                    Không có phụ xe
                  </MenuItem>
                ) : (
                  attendants.map((attendant) => (
                    <MenuItem key={attendant.id} value={attendant.id}>
                      {attendant.full_name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tổng số học sinh"
                type="number"
                value={formData.total_students}
                onChange={(e) => setFormData({ ...formData, total_students: e.target.value })}
                placeholder="VD: 15"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số học sinh hiện tại"
                type="number"
                value={formData.curr_students}
                onChange={(e) => setFormData({ ...formData, curr_students: e.target.value })}
                placeholder="VD: 0"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ kết thúc"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
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
                <MenuItem value={0}>Chưa bắt đầu</MenuItem>
                <MenuItem value={1}>Đang diễn ra</MenuItem>
                <MenuItem value={2}>Đã hoàn thành</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Ngày hoạt động trong tuần:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { key: 'is_mon', label: 'Thứ 2' },
                  { key: 'is_tue', label: 'Thứ 3' },
                  { key: 'is_wed', label: 'Thứ 4' },
                  { key: 'is_thu', label: 'Thứ 5' },
                  { key: 'is_fri', label: 'Thứ 6' },
                  { key: 'is_sat', label: 'Thứ 7' },
                ].map(day => (
                  <Button
                    key={day.key}
                    variant={formData[day.key] ? "contained" : "outlined"}
                    color={formData[day.key] ? "primary" : "inherit"}
                    size="small"
                    onClick={() => setFormData({ ...formData, [day.key]: !formData[day.key] })}
                    sx={{ minWidth: 70 }}
                  >
                    {day.label}
                  </Button>
                ))}
              </Box>
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

      {/* Map Dialog for assigning students */}
      <Dialog
        open={openMapDialog}
        onClose={() => setOpenMapDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Gán học sinh cho lộ trình: {selectedRoute?.name}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab icon={<MapIcon />} label="Bản đồ" />
            <Tab icon={<ListIcon />} label="Danh sách đã chọn" />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>🗺️ Tuyến đường thực tế:</strong>
                <br />
                • Hệ thống tự động tính toán tuyến đường tối ưu theo đường thực tế (sử dụng OSRM)
                <br />
                • Click vào marker để chọn/bỏ chọn học sinh
                <br />
                • Marker có số = điểm đón (theo thứ tự)
                <br />
                • Đường màu xanh dương = tuyến đường thực tế xe bus sẽ đi
                <br />
                • Thông tin khoảng cách và thời gian hiển thị ở góc phải trên
              </Alert>
              <RouteMap
                students={students}
                selectedStudents={selectedStudents}
                onStudentClick={handleStudentClick}
                showRoute={true}
                useRealRouting={true}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Paper sx={{ p: 2, minHeight: 400 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Học sinh đã chọn ({selectedStudents.length})
                </Typography>
                {selectedStudents.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Sử dụng mũi tên để sắp xếp thứ tự điểm đón
                  </Typography>
                )}
              </Box>
              {selectedStudents.length === 0 ? (
                <Typography color="text.secondary">
                  Chưa có học sinh nào được chọn
                </Typography>
              ) : (
                <List>
                  {selectedStudents.map((student, index) => (
                    <Box key={student.id}>
                      <ListItem
                        sx={{
                          bgcolor: 'background.default',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 'bold',
                            mr: 2,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <ListItemText
                          primary={student.name}
                          secondary={
                            <>
                              Lớp: {student.className} | {student.address}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveStudentUp(index)}
                            disabled={index === 0}
                            sx={{ mr: 0.5 }}
                          >
                            <ArrowUpIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveStudentDown(index)}
                            disabled={index === selectedStudents.length - 1}
                            sx={{ mr: 0.5 }}
                          >
                            <ArrowDownIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveStudent(student.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMapDialog(false)}>Hủy</Button>
          <Button
            onClick={handleSaveRouteStudents}
            variant="contained"
            disabled={selectedStudents.length === 0}
          >
            Lưu ({selectedStudents.length} học sinh)
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={openConfirm}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa lộ trình này?"
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
        <DialogTitle>Lọc lộ trình</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên lộ trình"
                value={filters.name__like}
                onChange={(e) => setFilters({ ...filters, name__like: e.target.value })}
                placeholder="Tìm theo tên..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tài xế"
                value={filters.driver_id__equal}
                onChange={(e) => setFilters({ ...filters, driver_id__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.full_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phụ xe"
                value={filters.assistant_id__equal}
                onChange={(e) => setFilters({ ...filters, assistant_id__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {attendants.map((attendant) => (
                  <MenuItem key={attendant.id} value={attendant.id}>
                    {attendant.full_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phương tiện"
                value={filters.vehicle_id__equal}
                onChange={(e) => setFilters({ ...filters, vehicle_id__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loại lộ trình"
                value={filters.type__equal}
                onChange={(e) => setFilters({ ...filters, type__equal: e.target.value })}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="0">Đón sáng</MenuItem>
                <MenuItem value="1">Trả chiều</MenuItem>
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
                <MenuItem value="0">Chưa bắt đầu</MenuItem>
                <MenuItem value="1">Đang diễn ra</MenuItem>
                <MenuItem value="2">Đã hoàn thành</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số học sinh"
                type="number"
                value={filters.total_students__equal}
                onChange={(e) => setFilters({ ...filters, total_students__equal: e.target.value })}
                placeholder="VD: 15"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu từ"
                type="datetime-local"
                value={filters.start_time__from}
                onChange={(e) => setFilters({ ...filters, start_time__from: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu đến"
                type="datetime-local"
                value={filters.start_time__to}
                onChange={(e) => setFilters({ ...filters, start_time__to: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)}>Hủy</Button>
          <Button onClick={handleClearFilters} color="warning">
            Xóa bộ lọc
          </Button>
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

      {/* Route Point Assigner Dialog */}
      <RoutePointAssigner
        open={openPointAssigner}
        onClose={() => {
          setOpenPointAssigner(false)
          setSelectedRoute(null)
        }}
        route={selectedRoute}
        onSuccess={() => {
          fetchData()
          setSnackbar({
            open: true,
            message: 'Gán điểm dừng và học sinh thành công!',
            severity: 'success',
          })
        }}
      />

      {/* View Route Dialog */}
      <Dialog
        open={openViewRouteDialog}
        onClose={() => {
          setOpenViewRouteDialog(false)
          setSelectedRoute(null)
        }}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          🗺️ Lộ trình: {selectedRoute?.name}
        </DialogTitle>
        <DialogContent>
          {selectedRoute && (
            <TripRouteMap
              tripId={selectedRoute.id}
              height="650px"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenViewRouteDialog(false)
              setSelectedRoute(null)
            }}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<LocationIcon />}
            onClick={() => {
              setOpenViewRouteDialog(false)
              setOpenPointAssigner(true)
            }}
          >
            Gán điểm dừng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Routes

