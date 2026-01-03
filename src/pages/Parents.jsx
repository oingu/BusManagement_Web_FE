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
    Grid,
    Alert,
    Snackbar,
    Pagination,
} from '@mui/material'
import { Add as AddIcon, FilterList } from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import {
    getStudentParents,
    createStudentParent,
    updateStudentParent,
    deleteStudentParent,
} from '../services/api'

const initialFormData = {
    user_id: 1,
    full_name: '',
    phone_number: '',
}

const Parents = () => {
    const [parents, setParents] = useState([])
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [openConfirm, setOpenConfirm] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [editingId, setEditingId] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    // Pagination and filter states
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalRecords, setTotalRecords] = useState(0)
    const [filters, setFilters] = useState({
        full_name__like: '',
        phone_number__like: '',
        phone_number__equal: '',
    })
    const [openFilterDialog, setOpenFilterDialog] = useState(false)

    useEffect(() => {
        fetchParents()
    }, [page])

    const fetchParents = async () => {
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

            const response = await getStudentParents(params)
            const parentsData = response.data.data || response.data

            // Set pagination metadata
            if (response.data.total !== undefined) {
                setTotalRecords(response.data.total)
                setTotalPages(response.data.last_page || 1)
            }

            setParents(parentsData)
        } catch (error) {
            console.error('Error fetching parents:', error)
            setParents([])
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (parent = null) => {
        if (parent) {
            setFormData({
                user_id: parent.user_id || 1,
                full_name: parent.full_name,
                phone_number: parent.phone_number,
            })
            setEditingId(parent.id)
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
                user_id: formData.user_id,
                full_name: formData.full_name,
                phone_number: formData.phone_number,
            }

            if (editingId) {
                await updateStudentParent(editingId, dataToSubmit)
                setSnackbar({
                    open: true,
                    message: 'Cập nhật phụ huynh thành công!',
                    severity: 'success',
                })
            } else {
                await createStudentParent(dataToSubmit)
                setSnackbar({
                    open: true,
                    message: 'Thêm phụ huynh thành công!',
                    severity: 'success',
                })
            }
            fetchParents()
            handleCloseDialog()
        } catch (error) {
            console.error('Error saving parent:', error)
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Có lỗi xảy ra!',
                severity: 'error',
            })
        }
    }

    const handleDelete = async () => {
        try {
            await deleteStudentParent(deleteId)
            setSnackbar({
                open: true,
                message: 'Xóa phụ huynh thành công!',
                severity: 'success',
            })
            fetchParents()
        } catch (error) {
            console.error('Error deleting parent:', error)
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
        setPage(1)
        fetchParents()
        setOpenFilterDialog(false)
    }

    const handleClearFilters = () => {
        setFilters({
            full_name__like: '',
            phone_number__like: '',
            phone_number__equal: '',
        })
        setPage(1)
    }

    const columns = [
        { id: 'id', label: 'ID' },
        { id: 'full_name', label: 'Họ và tên' },
        { id: 'phone_number', label: 'Số điện thoại' },
        { id: 'user_id', label: 'User ID' },
    ]

    if (loading) {
        return <Typography>Đang tải...</Typography>
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Quản lý Phụ huynh
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
                        Thêm phụ huynh
                    </Button>
                </Box>
            </Box>

            <DataTable
                columns={columns}
                data={parents}
                onEdit={handleOpenDialog}
                onDelete={(parent) => {
                    setDeleteId(parent.id)
                    setOpenConfirm(true)
                }}
                searchPlaceholder="Tìm kiếm phụ huynh..."
            />

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Tổng số: {totalRecords} phụ huynh
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
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Chỉnh sửa phụ huynh' : 'Thêm phụ huynh mới'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
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
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Số điện thoại"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                required
                                placeholder="VD: 0987654321"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="number"
                                label="User ID"
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                                required
                                helperText="ID của tài khoản người dùng liên kết"
                            />
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

            {/* Filter Dialog */}
            <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Lọc dữ liệu phụ huynh</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tên phụ huynh"
                                value={filters.full_name__like}
                                onChange={(e) => setFilters({ ...filters, full_name__like: e.target.value })}
                                placeholder="Tìm kiếm theo tên"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Số điện thoại (tìm kiếm)"
                                value={filters.phone_number__like}
                                onChange={(e) => setFilters({ ...filters, phone_number__like: e.target.value })}
                                placeholder="Tìm kiếm theo SĐT"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Số điện thoại (chính xác)"
                                value={filters.phone_number__equal}
                                onChange={(e) => setFilters({ ...filters, phone_number__equal: e.target.value })}
                                placeholder="Nhập chính xác SĐT"
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

            <ConfirmDialog
                open={openConfirm}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa phụ huynh này?"
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

export default Parents
