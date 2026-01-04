import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
    Box,
    Typography,
    Alert,
    Chip,
    CircularProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Paper,
    TextField,
    InputAdornment,
    Divider,
} from '@mui/material'
import {
    Search as SearchIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material'
import { getAllStudents } from '../services/api'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Selected point marker (red)
const selectedPointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Student marker (blue)
const studentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
})

// Component to handle map clicks
function ClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng)
        },
    })
    return null
}

// Component to fly to location
function FlyToLocation({ position }) {
    const map = useMap()

    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 16, { duration: 1 })
        }
    }, [position, map])

    return null
}

const PointMapPicker = ({
    latitude,
    longitude,
    onLocationChange,
}) => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPosition, setSelectedPosition] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [flyToPosition, setFlyToPosition] = useState(null)
    const defaultCenter = [21.0285, 105.8542] // Hanoi

    useEffect(() => {
        fetchAllStudents()
    }, [])

    useEffect(() => {
        if (latitude && longitude) {
            setSelectedPosition({
                lat: parseFloat(latitude),
                lng: parseFloat(longitude)
            })
        }
    }, [latitude, longitude])

    const fetchAllStudents = async () => {
        try {
            setLoading(true)
            const response = await getAllStudents()
            const studentsData = response.data.data || response.data || []

            // Filter students with valid coordinates
            const studentsWithLocation = studentsData.filter(
                s => s.latitude && s.longitude
            )
            setStudents(studentsWithLocation)
        } catch (error) {
            console.error('Error fetching students:', error)
            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    const handleMapClick = (lat, lng) => {
        setSelectedPosition({ lat, lng })
        onLocationChange(lat, lng)
    }

    const handleStudentClick = (student) => {
        const lat = parseFloat(student.latitude)
        const lng = parseFloat(student.longitude)
        setSelectedPosition({ lat, lng })
        setFlyToPosition({ lat, lng })
        onLocationChange(lat, lng)
    }

    // Filter students by search query
    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase()
        return (
            (student.full_name || student.name || '').toLowerCase().includes(query) ||
            (student.student_number || '').toLowerCase().includes(query) ||
            (student.address || '').toLowerCase().includes(query)
        )
    })

    // Calculate center based on students or selected position
    const getCenter = () => {
        if (selectedPosition) {
            return [selectedPosition.lat, selectedPosition.lng]
        }
        if (students.length > 0) {
            const avgLat = students.reduce((sum, s) => sum + parseFloat(s.latitude), 0) / students.length
            const avgLng = students.reduce((sum, s) => sum + parseFloat(s.longitude), 0) / students.length
            return [avgLat, avgLng]
        }
        return defaultCenter
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang tải vị trí học sinh...</Typography>
            </Box>
        )
    }

    return (
        <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Hướng dẫn:</strong> Click vào học sinh trong danh sách hoặc click trực tiếp trên bản đồ để chọn điểm dừng.
                <strong style={{ color: 'blue' }}> Marker xanh</strong> = Học sinh |
                <strong style={{ color: 'red' }}> Marker đỏ</strong> = Điểm dừng
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, height: 750 }}>
                {/* Student List - Left Side */}
                <Paper
                    elevation={2}
                    sx={{
                        width: 320,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Search Header */}
                    <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Danh sách học sinh ({filteredStudents.length})
                        </Typography>
                    </Box>

                    {/* Search Input */}
                    <Box sx={{ p: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Tìm kiếm học sinh..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Divider />

                    {/* Student List */}
                    <List
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            '& .MuiListItemButton-root:hover': {
                                bgcolor: 'primary.light',
                                color: 'white',
                            }
                        }}
                        dense
                    >
                        {filteredStudents.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary="Không tìm thấy học sinh"
                                    secondary="Thử tìm kiếm khác"
                                />
                            </ListItem>
                        ) : (
                            filteredStudents.map((student) => (
                                <ListItemButton
                                    key={student.id}
                                    onClick={() => handleStudentClick(student)}
                                    selected={selectedPosition &&
                                        parseFloat(student.latitude) === selectedPosition.lat &&
                                        parseFloat(student.longitude) === selectedPosition.lng
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                            <PersonIcon fontSize="small" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight="medium" noWrap>
                                                {student.full_name || student.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                    {student.student_number || `ID: ${student.id}`}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                    <LocationIcon sx={{ fontSize: 12, verticalAlign: 'middle' }} />
                                                    {student.address || 'Chưa có địa chỉ'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))
                        )}
                    </List>
                </Paper>

                {/* Map - Right Side */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <MapContainer
                        center={getCenter()}
                        zoom={14}
                        style={{
                            height: '100%',
                            width: '100%',
                            borderRadius: '8px',
                        }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <ClickHandler onMapClick={handleMapClick} />
                        <FlyToLocation position={flyToPosition} />

                        {/* Student markers */}
                        {students.map((student) => (
                            <Marker
                                key={student.id}
                                position={[parseFloat(student.latitude), parseFloat(student.longitude)]}
                                icon={studentIcon}
                                eventHandlers={{
                                    click: () => handleStudentClick(student)
                                }}
                            >
                                <Popup>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {student.full_name || student.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        Mã HS: {student.student_number || student.id}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Địa chỉ: {student.address || '-'}
                                    </Typography>
                                    <Typography variant="caption" color="primary">
                                        Click để chọn làm điểm dừng
                                    </Typography>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Selected point marker */}
                        {selectedPosition && (
                            <>
                                <Marker
                                    position={[selectedPosition.lat, selectedPosition.lng]}
                                    icon={selectedPointIcon}
                                >
                                    <Popup>
                                        <Typography variant="subtitle2" fontWeight="bold" color="error">
                                            📍 Điểm dừng được chọn
                                        </Typography>
                                        <Typography variant="body2">
                                            Vĩ độ: {selectedPosition.lat.toFixed(6)}
                                        </Typography>
                                        <Typography variant="body2">
                                            Kinh độ: {selectedPosition.lng.toFixed(6)}
                                        </Typography>
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={[selectedPosition.lat, selectedPosition.lng]}
                                    radius={100}
                                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
                                />
                            </>
                        )}
                    </MapContainer>
                </Box>
            </Box>

            {/* Selected Position Info */}
            {selectedPosition && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<LocationIcon />}
                        label={`Vĩ độ: ${selectedPosition.lat.toFixed(6)}`}
                        color="success"
                        size="small"
                    />
                    <Chip
                        icon={<LocationIcon />}
                        label={`Kinh độ: ${selectedPosition.lng.toFixed(6)}`}
                        color="success"
                        size="small"
                    />
                </Box>
            )}
        </Box>
    )
}

export default PointMapPicker
