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
    Chip,
    Pagination,
    Tabs,
    Tab,
} from '@mui/material'
import {
    Add as AddIcon,
    FilterList,
    LocationOn as LocationIcon,
    Map as MapIcon,
    Edit as EditIcon,
} from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import PointMapPicker from '../components/PointMapPicker'
import {
    getPoints,
    createPoint,
    updatePoint,
    deletePoint,
} from '../services/api'

// Point marker icon (red)
const pointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

const initialFormData = {
    address: '',
    latitude: '',
    longitude: '',
    type: 0,
}

const Points = () => {
    const [points, setPoints] = useState([])
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [openViewDialog, setOpenViewDialog] = useState(false)
    const [openConfirm, setOpenConfirm] = useState(false)
    const [openFilterDialog, setOpenFilterDialog] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [viewingPoint, setViewingPoint] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalRecords, setTotalRecords] = useState(0)
    const [dialogTab, setDialogTab] = useState(0) // 0 = Map, 1 = Form
    const [filters, setFilters] = useState({
        address__like: '',
        latitude__equal: '',
        longitude__equal: '',
        type__equal: '',
    })

    useEffect(() => {
        fetchPoints()
    }, [page, filters])

    const fetchPoints = async () => {
        try {
            setLoading(true)

            // Build query params
            const params = { page }
            Object.keys(filters).forEach(key => {
                if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
                    params[key] = filters[key]
                }
            })

            const response = await getPoints(params)

            // Handle response
            const pointsData = response.data.data || response.data
            if (response.data.total !== undefined) {
                setTotalRecords(response.data.total)
                setTotalPages(response.data.last_page || 1)
            }

            // Map to display format
            const mappedPoints = pointsData.map(point => ({
                id: point.id,
                address: point.address || '-',
                latitude: point.latitude,
                longitude: point.longitude,
                type: point.type,
                typeDisplay: point.type === 0 ? 'Điểm phụ' : 'Điểm dừng',
                created_at: point.created_at,
                updated_at: point.updated_at,
            }))

            setPoints(mappedPoints)
        } catch (error) {
            console.error('Error fetching points:', error)
            setPoints([])
            setSnackbar({
                open: true,
                message: 'Không thể tải danh sách điểm dừng!',
                severity: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (point = null) => {
        if (point) {
            setFormData({
                address: point.address || '',
                latitude: point.latitude || '',
                longitude: point.longitude || '',
                type: point.type,
            })
            setEditingId(point.id)
            setDialogTab(1) // Go to form tab when editing
        } else {
            setFormData(initialFormData)
            setEditingId(null)
            setDialogTab(0) // Start with map tab when creating
        }
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setFormData(initialFormData)
        setEditingId(null)
        setDialogTab(0)
    }

    const handleLocationChange = (lat, lng) => {
        setFormData({
            ...formData,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
        })
    }

    const handleOpenViewDialog = (point) => {
        setViewingPoint(point)
        setOpenViewDialog(true)
    }

    const handleSubmit = async () => {
        try {
            // Validation
            if (!formData.address || !formData.latitude || !formData.longitude) {
                setSnackbar({
                    open: true,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
                    severity: 'warning',
                })
                return
            }

            const dataToSubmit = {
                address: formData.address.trim(),
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                type: parseInt(formData.type),
            }

            if (editingId) {
                await updatePoint(editingId, dataToSubmit)
                setSnackbar({
                    open: true,
                    message: 'Cập nhật điểm dừng thành công!',
                    severity: 'success',
                })
            } else {
                await createPoint(dataToSubmit)
                setSnackbar({
                    open: true,
                    message: 'Thêm điểm dừng thành công!',
                    severity: 'success',
                })
            }
            fetchPoints()
            handleCloseDialog()
        } catch (error) {
            console.error('Error saving point:', error)
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                (editingId ? 'Không thể cập nhật điểm dừng!' : 'Không thể thêm điểm dừng!')
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error',
            })
        }
    }

    const handleDelete = async () => {
        try {
            await deletePoint(deleteId)
            setSnackbar({
                open: true,
                message: 'Xóa điểm dừng thành công!',
                severity: 'success',
            })
            // Smart pagination
            if (points.length === 1 && page > 1) {
                setPage(page - 1)
            } else {
                fetchPoints()
            }
        } catch (error) {
            console.error('Error deleting point:', error)
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Không thể xóa điểm dừng!'
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
        setOpenFilterDialog(false)
    }

    const handleClearFilters = () => {
        setFilters({
            address__like: '',
            latitude__equal: '',
            longitude__equal: '',
            type__equal: '',
        })
        setPage(1)
        setOpenFilterDialog(false)
    }

    const columns = [
        { id: 'id', label: 'ID' },
        { id: 'address', label: 'Địa chỉ' },
        {
            id: 'latitude',
            label: 'Vĩ độ',
            render: (value) => value ? parseFloat(value).toFixed(6) : '-'
        },
        {
            id: 'longitude',
            label: 'Kinh độ',
            render: (value) => value ? parseFloat(value).toFixed(6) : '-'
        },
        {
            id: 'typeDisplay',
            label: 'Loại điểm',
            render: (value, row) => (
                <Chip
                    label={value}
                    size="small"
                    color={row.type === 1 ? 'primary' : 'default'}
                    icon={<LocationIcon />}
                />
            )
        },
        {
            id: 'created_at',
            label: 'Ngày tạo',
            render: (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
        },
    ]

    if (loading && points.length === 0) {
        return <Typography>Đang tải...</Typography>
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý Điểm dừng
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
                        Thêm điểm dừng
                    </Button>
                </Box>
            </Box>

            <DataTable
                columns={columns}
                data={points}
                onEdit={handleOpenDialog}
                onDelete={(point) => {
                    setDeleteId(point.id)
                    setOpenConfirm(true)
                }}
                onView={handleOpenViewDialog}
                searchPlaceholder="Tìm kiếm điểm dừng..."
            />

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Tổng số: {totalRecords} điểm dừng
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

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
                <DialogTitle>
                    {editingId ? 'Chỉnh sửa điểm dừng' : 'Thêm điểm dừng mới'}
                </DialogTitle>
                <DialogContent>
                    {/* Tabs for switching between Map and Form */}
                    <Tabs
                        value={dialogTab}
                        onChange={(e, newValue) => setDialogTab(newValue)}
                        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                    >
                        <Tab icon={<MapIcon />} label="Chọn từ bản đồ" iconPosition="start" />
                        <Tab icon={<EditIcon />} label="Nhập thủ công" iconPosition="start" />
                    </Tabs>

                    {/* Tab 0: Map View */}
                    {dialogTab === 0 && (
                        <Box>
                            <PointMapPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onLocationChange={handleLocationChange}
                            />

                            {/* Quick form fields after selecting from map */}
                            {(formData.latitude && formData.longitude) && (
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid item xs={12}>
                                        <Alert severity="success" sx={{ mb: 2 }}>
                                            Đã chọn vị trí: {formData.latitude}, {formData.longitude}
                                        </Alert>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Địa chỉ"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                            placeholder="Nhập địa chỉ cho điểm dừng này"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Loại điểm"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            required
                                        >
                                            <MenuItem value={0}>Điểm phụ</MenuItem>
                                            <MenuItem value={1}>Điểm dừng</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    )}

                    {/* Tab 1: Manual Form */}
                    {dialogTab === 1 && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Địa chỉ"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    placeholder="VD: 123 Đường Láng, Quận Đống Đa, Hà Nội"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Vĩ độ (Latitude)"
                                    type="number"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    required
                                    placeholder="VD: 21.028511"
                                    inputProps={{ step: 'any' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Kinh độ (Longitude)"
                                    type="number"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    required
                                    placeholder="VD: 105.804817"
                                    inputProps={{ step: 'any' }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Loại điểm"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <MenuItem value={0}>Điểm phụ</MenuItem>
                                    <MenuItem value={1}>Điểm dừng</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingId ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Chi tiết điểm dừng</DialogTitle>
                <DialogContent>
                    {viewingPoint && (
                        <Box>
                            {/* Map showing point location */}
                            {viewingPoint.latitude && viewingPoint.longitude && (
                                <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                                    <MapContainer
                                        center={[parseFloat(viewingPoint.latitude), parseFloat(viewingPoint.longitude)]}
                                        zoom={16}
                                        style={{ height: '350px', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker
                                            position={[parseFloat(viewingPoint.latitude), parseFloat(viewingPoint.longitude)]}
                                            icon={pointIcon}
                                        />
                                        <Circle
                                            center={[parseFloat(viewingPoint.latitude), parseFloat(viewingPoint.longitude)]}
                                            radius={100}
                                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                                        />
                                    </MapContainer>
                                </Box>
                            )}

                            {/* Point Details */}
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                                    <Typography variant="body1">{viewingPoint.id}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Loại điểm</Typography>
                                    <Chip
                                        label={viewingPoint.typeDisplay}
                                        size="small"
                                        color={viewingPoint.type === 1 ? 'primary' : 'default'}
                                        icon={<LocationIcon />}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Địa chỉ</Typography>
                                    <Typography variant="body1">{viewingPoint.address}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Vĩ độ</Typography>
                                    <Typography variant="body1">{viewingPoint.latitude}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Kinh độ</Typography>
                                    <Typography variant="body1">{viewingPoint.longitude}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Ngày tạo</Typography>
                                    <Typography variant="body1">
                                        {viewingPoint.created_at ? new Date(viewingPoint.created_at).toLocaleString('vi-VN') : '-'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Ngày cập nhật</Typography>
                                    <Typography variant="body1">
                                        {viewingPoint.updated_at ? new Date(viewingPoint.updated_at).toLocaleString('vi-VN') : '-'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setOpenViewDialog(false)
                            handleOpenDialog(viewingPoint)
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Lọc điểm dừng</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Địa chỉ"
                                value={filters.address__like}
                                onChange={(e) => setFilters({ ...filters, address__like: e.target.value })}
                                placeholder="Tìm theo địa chỉ..."
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Vĩ độ"
                                type="number"
                                value={filters.latitude__equal}
                                onChange={(e) => setFilters({ ...filters, latitude__equal: e.target.value })}
                                placeholder="VD: 21.028511"
                                inputProps={{ step: 'any' }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Kinh độ"
                                type="number"
                                value={filters.longitude__equal}
                                onChange={(e) => setFilters({ ...filters, longitude__equal: e.target.value })}
                                placeholder="VD: 105.804817"
                                inputProps={{ step: 'any' }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Loại điểm"
                                value={filters.type__equal}
                                onChange={(e) => setFilters({ ...filters, type__equal: e.target.value })}
                            >
                                <MenuItem value="">Tất cả</MenuItem>
                                <MenuItem value="0">Điểm phụ</MenuItem>
                                <MenuItem value="1">Điểm dừng</MenuItem>
                            </TextField>
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

            <ConfirmDialog
                open={openConfirm}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa điểm dừng này?"
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

export default Points
