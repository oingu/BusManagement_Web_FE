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
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { 
  Add as AddIcon, 
  VpnKey as ResetIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  resetPassword,
  getStudentsByParent,
  getStudents,
  linkStudentToParent,
  unlinkStudentFromParent,
} from '../services/api'

const initialFormData = {
  username: '',
  password: '',
  accountType: 'parent',
  relatedName: '',
  relatedPhone: '',
  email: '',
  status: 'active',
}

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openResetConfirm, setOpenResetConfirm] = useState(false)
  const [openStudentsDialog, setOpenStudentsDialog] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [resetId, setResetId] = useState(null)
  const [selectedParent, setSelectedParent] = useState(null)
  const [parentStudents, setParentStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response.data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      // Mock data for demo
      setAccounts([
        {
          id: 1,
          username: 'phuhuynhnguyen',
          accountType: 'Phụ huynh',
          relatedName: 'Nguyễn Văn Cha',
          relatedPhone: '0901234567',
          email: 'nguyen@example.com',
          status: 'Hoạt động',
          studentCount: 2,
        },
        {
          id: 2,
          username: 'phuhuynh.tran',
          accountType: 'Phụ huynh',
          relatedName: 'Trần Văn Cha',
          relatedPhone: '0902345678',
          email: 'tran@example.com',
          status: 'Hoạt động',
          studentCount: 1,
        },
        {
          id: 3,
          username: 'phuxetran',
          accountType: 'Phụ xe',
          relatedName: 'Trần Thị B',
          relatedPhone: '0987654321',
          email: 'tranthib@example.com',
          status: 'Hoạt động',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (account = null) => {
    if (account) {
      setFormData({
        username: account.username,
        password: '',
        accountType: account.accountType === 'Phụ huynh' ? 'parent' : 'attendant',
        relatedName: account.relatedName,
        relatedPhone: account.relatedPhone,
        email: account.email || '',
        status: account.status === 'Hoạt động' ? 'active' : 'inactive',
      })
      setEditingId(account.id)
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
        accountType: formData.accountType === 'parent' ? 'Phụ huynh' : 'Phụ xe',
        status: formData.status === 'active' ? 'Hoạt động' : 'Khóa',
      }

      if (editingId) {
        // Don't send password if empty in edit mode
        if (!dataToSubmit.password) {
          delete dataToSubmit.password
        }
        await updateAccount(editingId, dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Cập nhật tài khoản thành công!',
          severity: 'success',
        })
      } else {
        await createAccount(dataToSubmit)
        setSnackbar({
          open: true,
          message: 'Thêm tài khoản thành công!',
          severity: 'success',
        })
      }
      fetchAccounts()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving account:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAccount(deleteId)
      setSnackbar({
        open: true,
        message: 'Xóa tài khoản thành công!',
        severity: 'success',
      })
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
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

  const handleResetPassword = async () => {
    try {
      await resetPassword(resetId)
      setSnackbar({
        open: true,
        message: 'Reset mật khẩu thành công! Mật khẩu mới đã được gửi qua email.',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error resetting password:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    } finally {
      setOpenResetConfirm(false)
      setResetId(null)
    }
  }

  const handleViewStudents = async (account) => {
    if (account.accountType !== 'Phụ huynh') {
      setSnackbar({
        open: true,
        message: 'Chỉ tài khoản phụ huynh mới có học sinh!',
        severity: 'warning',
      })
      return
    }

    setSelectedParent(account)
    setOpenStudentsDialog(true)

    try {
      const [studentsRes, allStudentsRes] = await Promise.all([
        getStudentsByParent(account.id),
        getStudents(),
      ])
      setParentStudents(studentsRes.data)
      setAllStudents(allStudentsRes.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      // Mock data for demo
      setParentStudents([
        {
          id: 1,
          name: 'Nguyễn Văn Nam',
          studentCode: 'HS001',
          className: '5A',
        },
        {
          id: 3,
          name: 'Nguyễn Thị Hương',
          studentCode: 'HS003',
          className: '3B',
        },
      ])
      setAllStudents([
        {
          id: 1,
          name: 'Nguyễn Văn Nam',
          studentCode: 'HS001',
          className: '5A',
        },
        {
          id: 2,
          name: 'Trần Thị Lan',
          studentCode: 'HS002',
          className: '4B',
        },
        {
          id: 3,
          name: 'Nguyễn Thị Hương',
          studentCode: 'HS003',
          className: '3B',
        },
      ])
    }
  }

  const handleLinkStudent = async (studentId) => {
    try {
      await linkStudentToParent(selectedParent.id, studentId)
      setSnackbar({
        open: true,
        message: 'Liên kết học sinh thành công!',
        severity: 'success',
      })
      handleViewStudents(selectedParent)
      fetchAccounts()
    } catch (error) {
      console.error('Error linking student:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const handleUnlinkStudent = async (studentId) => {
    try {
      await unlinkStudentFromParent(selectedParent.id, studentId)
      setSnackbar({
        open: true,
        message: 'Hủy liên kết học sinh thành công!',
        severity: 'success',
      })
      handleViewStudents(selectedParent)
      fetchAccounts()
    } catch (error) {
      console.error('Error unlinking student:', error)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra!',
        severity: 'error',
      })
    }
  }

  const columns = [
    { id: 'username', label: 'Tên đăng nhập' },
    { id: 'accountType', label: 'Loại tài khoản' },
    { id: 'relatedName', label: 'Tên người dùng' },
    { id: 'relatedPhone', label: 'Số điện thoại' },
    { id: 'email', label: 'Email' },
    {
      id: 'studentCount',
      label: 'Học sinh',
      render: (value, row) => {
        if (row.accountType !== 'Phụ huynh') return '-'
        return (
          <Chip
            icon={<SchoolIcon />}
            label={value || 0}
            color={value > 0 ? 'primary' : 'default'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleViewStudents(row)
            }}
            sx={{ cursor: 'pointer' }}
          />
        )
      },
    },
    { id: 'status', label: 'Trạng thái', type: 'status' },
    {
      id: 'actions',
      label: 'Reset MK',
      render: (value, row) => (
        <Tooltip title="Reset mật khẩu">
          <IconButton
            color="warning"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              setResetId(row.id)
              setOpenResetConfirm(true)
            }}
          >
            <ResetIcon />
          </IconButton>
        </Tooltip>
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
          Quản lý Tài khoản
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm tài khoản
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Tài khoản này dùng cho ứng dụng mobile của phụ huynh và phụ xe. Mật khẩu mặc
        định sẽ được gửi qua email hoặc SMS.
      </Alert>

      <DataTable
        columns={columns}
        data={accounts}
        onEdit={handleOpenDialog}
        onDelete={(account) => {
          setDeleteId(account.id)
          setOpenConfirm(true)
        }}
        searchPlaceholder="Tìm kiếm tài khoản..."
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                disabled={editingId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={editingId ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Loại tài khoản"
                value={formData.accountType}
                onChange={(e) =>
                  setFormData({ ...formData, accountType: e.target.value })
                }
                required
              >
                <MenuItem value="parent">Phụ huynh</MenuItem>
                <MenuItem value="attendant">Phụ xe</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên người dùng"
                value={formData.relatedName}
                onChange={(e) =>
                  setFormData({ ...formData, relatedName: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.relatedPhone}
                onChange={(e) =>
                  setFormData({ ...formData, relatedPhone: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <MenuItem value="inactive">Khóa</MenuItem>
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
        message="Bạn có chắc chắn muốn xóa tài khoản này?"
        onConfirm={handleDelete}
        onCancel={() => {
          setOpenConfirm(false)
          setDeleteId(null)
        }}
        confirmText="Xóa"
        confirmColor="error"
      />

      <ConfirmDialog
        open={openResetConfirm}
        title="Xác nhận reset mật khẩu"
        message="Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này? Mật khẩu mới sẽ được gửi qua email."
        onConfirm={handleResetPassword}
        onCancel={() => {
          setOpenResetConfirm(false)
          setResetId(null)
        }}
        confirmText="Reset"
        confirmColor="warning"
      />

      {/* Dialog hiển thị học sinh của phụ huynh */}
      <Dialog
        open={openStudentsDialog}
        onClose={() => setOpenStudentsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Học sinh của: {selectedParent?.relatedName}
          <Typography variant="body2" color="text.secondary">
            Tài khoản: {selectedParent?.username}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Học sinh đã liên kết ({parentStudents.length})
            </Typography>
            {parentStudents.length === 0 ? (
              <Alert severity="info">Chưa có học sinh nào được liên kết</Alert>
            ) : (
              <List>
                {parentStudents.map((student) => (
                  <Box key={student.id}>
                    <ListItem>
                      <ListItemText
                        primary={student.name}
                        secondary={`Mã HS: ${student.studentCode} | Lớp: ${student.className}`}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleUnlinkStudent(student.id)}
                      >
                        Hủy liên kết
                      </Button>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
              </List>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="h6" gutterBottom>
              Thêm học sinh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Chọn học sinh để liên kết với tài khoản này
            </Typography>
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {allStudents
                .filter(s => !parentStudents.some(ps => ps.id === s.id))
                .map((student) => (
                  <Box key={student.id}>
                    <ListItem>
                      <ListItemText
                        primary={student.name}
                        secondary={`Mã HS: ${student.studentCode} | Lớp: ${student.className}`}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleLinkStudent(student.id)}
                      >
                        Liên kết
                      </Button>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStudentsDialog(false)}>Đóng</Button>
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

export default Accounts

