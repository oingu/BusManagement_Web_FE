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
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  List as ListIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import RouteMap from '../components/RouteMap'
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getStudents,
  getVehicles,
  getEmployees,
  assignStudentsToRoute,
} from '../services/api'

const initialFormData = {
  name: '',
  vehicleId: '',
  driverId: '',
  attendantId: '',
  routeType: 'pickup',
  startTime: '',
  endTime: '',
  status: 'active',
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
  const [openConfirm, setOpenConfirm] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [routesRes, studentsRes, vehiclesRes, employeesRes] = await Promise.all([
        getRoutes(),
        getStudents(),
        getVehicles(),
        getEmployees(),
      ])
      
      setRoutes(routesRes.data)
      setStudents(studentsRes.data)
      setVehicles(vehiclesRes.data)
      
      // Separate drivers and attendants
      const employeesList = employeesRes.data
      setDrivers(employeesList.filter(e => e.position === 'Tài xế'))
      setAttendants(employeesList.filter(e => e.position === 'Phụ xe'))
    } catch (error) {
      console.error('Error fetching data:', error)
      // Mock data for demo
      setRoutes([
        {
          id: 1,
          name: 'Lộ trình 1 - Đống Đa',
          vehicle: '29B-12345',
          driver: 'Nguyễn Văn A',
          attendant: 'Trần Thị B',
          routeType: 'Đón sáng',
          startTime: '06:30',
          endTime: '07:30',
          studentCount: 15,
          status: 'Hoạt động',
        },
      ])
      // Mock data for students - import from mockRoutingData  
      const { MOCK_STUDENTS_WITH_LOCATION } = await import('../services/mockRoutingData')
      setStudents(MOCK_STUDENTS_WITH_LOCATION)
      setVehicles([
        { id: 1, licensePlate: '29B-12345', capacity: 30 },
        { id: 2, licensePlate: '30A-67890', capacity: 25 },
      ])
      setDrivers([{ id: 1, name: 'Nguyễn Văn A' }])
      setAttendants([{ id: 1, name: 'Trần Thị B' }])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (route = null) => {
    if (route) {
      setFormData({
        name: route.name,
        vehicleId: route.vehicleId || '',
        driverId: route.driverId || '',
        attendantId: route.attendantId || '',
        routeType: route.routeType === 'Đón sáng' ? 'pickup' : 'dropoff',
        startTime: route.startTime || '',
        endTime: route.endTime || '',
        status: route.status === 'Hoạt động' ? 'active' : 'inactive',
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
      const dataToSubmit = {
        ...formData,
        routeType: formData.routeType === 'pickup' ? 'Đón sáng' : 'Trả chiều',
        status: formData.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động',
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
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
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
      label: 'Bản đồ',
      render: (value, row) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<MapIcon />}
          onClick={(e) => {
            e.stopPropagation()
            handleOpenMapDialog(row)
          }}
        >
          Xem
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm lộ trình
        </Button>
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
                placeholder="VD: Lộ trình 1 - Đống Đa"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phương tiện"
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                required
              >
                {vehicles.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} ({vehicle.capacity} chỗ)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Loại lộ trình"
                value={formData.routeType}
                onChange={(e) => setFormData({ ...formData, routeType: e.target.value })}
                required
              >
                <MenuItem value="pickup">Đón sáng</MenuItem>
                <MenuItem value="dropoff">Trả chiều</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Tài xế"
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                required
              >
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Phụ xe"
                value={formData.attendantId}
                onChange={(e) =>
                  setFormData({ ...formData, attendantId: e.target.value })
                }
                required
              >
                {attendants.map((attendant) => (
                  <MenuItem key={attendant.id} value={attendant.id}>
                    {attendant.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giờ kết thúc"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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

export default Routes

