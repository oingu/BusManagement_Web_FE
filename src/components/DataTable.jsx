import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { useState } from 'react'

const DataTable = ({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Client-side filtering
  const filteredData = searchable
    ? data.filter((row) =>
      Object.values(row).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    : data

  const renderCellContent = (row, column) => {
    const value = row[column.id]

    if (column.render) {
      return column.render(value, row)
    }

    if (column.type === 'status') {
      const color = value === 'active' || value === 'Hoạt động' ? 'success' : 'default'
      return <Chip label={value} color={color} size="small" />
    }

    return value
  }

  return (
    <Box>
      {searchable && (
        <TextField
          fullWidth
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, index) => (
                <TableRow key={row.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    {onView && (
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => onView(row)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onEdit && (
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => onEdit(row)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Xóa">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => onDelete(row)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default DataTable

