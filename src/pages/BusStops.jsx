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
import MapPicker from '../components/MapPicker'
import {
    getBusStops,
    createBusStop,
    updateBusStop,
    deleteBusStop,
} from '../services/api'

const initialFormData = {
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    status: 'active',
}

const BusStops = () => {
    const [busStops, setBusStops] = useState([])
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [openConfirm, setOpenConfirm] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    useEffect(() => {
        fetchBusStops()
    }, [])

    const fetchBusStops = async () => {
        // Mock data for demo (since backend API is not ready yet)
        const mockData = [
            {
                id: 1,
                name: 'Ngã tư Lê Văn Lương',
                latitude: 21.0285,
                longitude: 105.8542,
                address: 'Số 123 Lê Văn Lương, Thanh Xuân, Hà Nội',
                status: 'Hoạt động',
            },
            {
                id: 2,
                name: 'Ngã tư Trung Hòa - Nhân Chính',
                latitude: 21.0055,
                longitude: 105.8136,
                address: 'Ngã tư Trung Hòa - Nhân Chính, Cầu Giấy, Hà Nội',
                status: 'Hoạt động',
            },
            {
                id: 3,
                name: 'Bến xe Mỹ Đình',
                latitude: 21.0277,
                longitude: 105.7800,
                address: 'Bến xe Mỹ Đình, Nam Từ Liêm, Hà Nội',
                status: 'Hoạt động',
            },
        ]

        try {
            const response = await getBusStops()
            // If API returns data, use it; otherwise use mock data
            if (response.data && response.data.length > 0) {
                setBusStops(response.data)
            } else {
                setBusStops(mockData)
            }
        } catch (error) {
            console.error('Error fetching bus stops:', error)
            // Use mock data when API fails
            setBusStops(mockData)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (busStop = null) => {
        if (busStop) {
            setFormData({
                name: busStop.name,
                latitude: busStop.latitude.toString(),
                longitude: busStop.longitude.toString(),
                address: busStop.address || '',
                status: busStop.status === 'Hoạt động' ? 'active' : 'inactive',
            })
            setEditingId(busStop.id)
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

    const handleLocationChange = (lat, lng) => {
        setFormData({
            ...formData,
            latitude: lat.toString(),
            longitude: lng.toString(),
        })
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            setSnackbar({
                open: true,
                message: 'Vui lòng nhập tên điểm dừng!',
                severity: 'error',
            })
            return
        }

        if (!formData.latitude || !formData.longitude) {
            setSnackbar({
                open: true,
                message: 'Vui lòng chọn vị trí trên bản đồ!',
                severity: 'error',
            })
            return
        }

        try {
            const dataToSubmit = {
                name: formData.name,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                address: formData.address,
                status: formData.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động',
            }

            if (editingId) {
                await updateBusStop(editingId, dataToSubmit)
                setSnackbar({
                    open: true,
                    message: 'Cập nhật điểm dừng thành công!',
                    severity: 'success',
                })
            } else {
                await createBusStop(dataToSubmit)
                setSnackbar({
                    open: true,
                    message: 'Thêm điểm dừng thành công!',
                    severity: 'success',
                })
            }
            fetchBusStops()
            handleCloseDialog()
        } catch (error) {
            console.error('Error saving bus stop:', error)
            setSnackbar({
                open: true,
                message: 'Có lỗi xảy ra!',
                severity: 'error',
            })
        }
    }

    const handleDelete = async () => {
        try {
            await deleteBusStop(deleteId)
            setSnackbar({
                open: true,
                message: 'Xóa điểm dừng thành công!',
                severity: 'success',
            })
            fetchBusStops()
        } catch (error) {
            console.error('Error deleting bus stop:', error)
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
        { id: 'name', label: 'Tên điểm dừng' },
        {
            id: 'latitude',
            label: 'Vĩ độ',
            render: (row) => row.latitude ? row.latitude.toFixed(6) : 'N/A'
        },
        {
            id: 'longitude',
            label: 'Kinh độ',
            render: (row) => row.longitude ? row.longitude.toFixed(6) : 'N/A'
        },
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
                    Quản lý Điểm dừng
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm điểm dừng
                </Button>
            </Box>

            <DataTable
                columns={columns}
                data={busStops}
                onEdit={handleOpenDialog}
                onDelete={(busStop) => {
                    setDeleteId(busStop.id)
                    setOpenConfirm(true)
                }}
                searchPlaceholder="Tìm kiếm điểm dừng..."
            />

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingId ? 'Chỉnh sửa điểm dừng' : 'Thêm điểm dừng mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tên điểm dừng"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                                placeholder="VD: Ngã tư Lê Văn Lương"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                                Vị trí điểm dừng <span style={{ color: 'red' }}>*</span>
                            </Typography>
                            <MapPicker
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onLocationChange={handleLocationChange}
                                address={formData.address}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Địa chỉ (tùy chọn)"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="VD: Số 123 Lê Văn Lương, Thanh Xuân, Hà Nội"
                                multiline
                                rows={2}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="Trạng thái"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
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

export default BusStops
