import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    Badge,
} from '@mui/material'
import {
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Check as CheckIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAllPoints, getAllStudents, assignPointStudents, getVehicle } from '../services/api'
import { calculateRoute, formatDistance, formatDuration } from '../services/routingService'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Point marker (red)
const pointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Selected point marker (green)
const selectedPointIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
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

// Selected student marker (orange)
const selectedStudentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Component to fly to location
function FlyToLocation({ position, zoom = 15 }) {
    const map = useMap()
    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom, { duration: 1 })
        }
    }, [position, zoom, map])
    return null
}

// School marker icon
const schoolIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
})

const RoutePointAssigner = ({ open, onClose, route, onSuccess }) => {
    const [step, setStep] = useState(0) // 0: Select points, 1: Assign students
    const [points, setPoints] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Selected points in order
    const [selectedPoints, setSelectedPoints] = useState([])
    // Current point being assigned students
    const [currentPointIndex, setCurrentPointIndex] = useState(0)
    // Map of pointId -> [studentIds]
    const [pointStudents, setPointStudents] = useState({})
    // Fly to position
    const [flyTo, setFlyTo] = useState(null)

    // Real route from OSRM
    const [realRoute, setRealRoute] = useState(null)
    const [routeInfo, setRouteInfo] = useState(null)
    const [loadingRoute, setLoadingRoute] = useState(false)

    // Vehicle capacity limit (capacity - 2 for driver and assistant)
    const [vehicleCapacity, setVehicleCapacity] = useState(30)
    const [maxStudents, setMaxStudents] = useState(28)
    const [capacityError, setCapacityError] = useState(null)

    // School location (can be configured)
    const schoolLocation = { lat: 21.0285, lng: 105.8542 }
    const defaultCenter = [schoolLocation.lat, schoolLocation.lng]

    // Calculate straight line route path (fallback)
    const getStraightRoutePath = () => {
        if (selectedPoints.length === 0) return []

        const path = []
        path.push([schoolLocation.lat, schoolLocation.lng])

        selectedPoints.forEach(point => {
            const lat = parseFloat(point.latitude)
            const lng = parseFloat(point.longitude)
            if (!isNaN(lat) && !isNaN(lng)) {
                path.push([lat, lng])
            }
        })

        path.push([schoolLocation.lat, schoolLocation.lng])
        return path
    }

    const straightRoutePath = getStraightRoutePath()

    // Calculate real route using OSRM when selectedPoints change
    useEffect(() => {
        const fetchRealRoute = async () => {
            if (selectedPoints.length === 0) {
                setRealRoute(null)
                setRouteInfo(null)
                return
            }

            setLoadingRoute(true)

            try {
                // Build waypoints: School -> Points -> School (OSRM format: [lng, lat])
                const waypoints = []
                waypoints.push([schoolLocation.lng, schoolLocation.lat])

                selectedPoints.forEach(point => {
                    const lat = parseFloat(point.latitude)
                    const lng = parseFloat(point.longitude)
                    if (!isNaN(lat) && !isNaN(lng)) {
                        waypoints.push([lng, lat])
                    }
                })

                waypoints.push([schoolLocation.lng, schoolLocation.lat])

                if (waypoints.length < 3) {
                    setRealRoute(null)
                    setRouteInfo(null)
                    return
                }

                const result = await calculateRoute(waypoints)

                if (result.success) {
                    // Convert from [lng, lat] to [lat, lng] for Leaflet
                    const leafletCoords = result.coordinates.map(coord => [coord[1], coord[0]])
                    setRealRoute(leafletCoords)
                    setRouteInfo({
                        distance: result.distance,
                        duration: result.duration,
                    })
                } else {
                    setRealRoute(null)
                    setRouteInfo(null)
                }
            } catch (error) {
                console.error('Error calculating route:', error)
                setRealRoute(null)
                setRouteInfo(null)
            } finally {
                setLoadingRoute(false)
            }
        }

        fetchRealRoute()
    }, [selectedPoints, schoolLocation.lat, schoolLocation.lng])

    useEffect(() => {
        if (open) {
            fetchData()
            resetState()
        }
    }, [open])

    const resetState = () => {
        setStep(0)
        setSelectedPoints([])
        setCurrentPointIndex(0)
        setPointStudents({})
        setFlyTo(null)
        setRealRoute(null)
        setRouteInfo(null)
    }

    const fetchData = async () => {
        try {
            setLoading(true)

            // Fetch vehicle capacity if route has vehicle_id
            if (route?.vehicle_id) {
                try {
                    const vehicleRes = await getVehicle(route.vehicle_id)
                    const vehicleData = vehicleRes.data.data || vehicleRes.data
                    console.log('Vehicle details:', vehicleData)
                    const capacity = vehicleData.capacity || 30
                    setVehicleCapacity(capacity)
                    setMaxStudents(Math.max(0, capacity - 2))
                } catch (vehicleError) {
                    console.error('Error fetching vehicle:', vehicleError)
                    // Fallback to default
                    setVehicleCapacity(30)
                    setMaxStudents(28)
                }
            }

            const [pointsRes, studentsRes] = await Promise.all([
                getAllPoints(), // Use /points/all API
                getAllStudents(),
            ])

            const pointsData = pointsRes.data.data || pointsRes.data || []
            const studentsData = studentsRes.data.data || studentsRes.data || []

            console.log('All points:', pointsData)
            console.log('All students:', studentsData)
            console.log('Vehicle capacity:', vehicleCapacity, 'Max students:', maxStudents)

            // Filter points with valid coordinates
            setPoints(pointsData.filter(p => {
                const lat = parseFloat(p.latitude)
                const lng = parseFloat(p.longitude)
                return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
            }))

            // Filter students with valid coordinates
            setStudents(studentsData.filter(s => {
                const lat = parseFloat(s.latitude)
                const lng = parseFloat(s.longitude)
                return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
            }))
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Step 0: Handle point selection
    const handlePointClick = (point) => {
        const isSelected = selectedPoints.find(p => p.id === point.id)
        if (isSelected) {
            setSelectedPoints(selectedPoints.filter(p => p.id !== point.id))
        } else {
            setSelectedPoints([...selectedPoints, point])
            // Initialize empty student array for this point
            setPointStudents(prev => ({
                ...prev,
                [point.id]: prev[point.id] || []
            }))
        }
    }

    // Calculate total assigned students (needed for capacity check)
    const totalAssignedStudents = Object.values(pointStudents).reduce((sum, ids) => sum + ids.length, 0)
    const remainingCapacity = maxStudents - totalAssignedStudents

    // Move to student assignment step
    const handleNextToStudents = () => {
        if (selectedPoints.length === 0) return
        setStep(1)
        setCurrentPointIndex(0)
        // Fly to first point
        const firstPoint = selectedPoints[0]
        setFlyTo([parseFloat(firstPoint.latitude), parseFloat(firstPoint.longitude)])
    }

    // Step 1: Handle student selection for current point
    const handleStudentClick = (student) => {
        const currentPoint = selectedPoints[currentPointIndex]
        if (!currentPoint) return

        const currentStudents = pointStudents[currentPoint.id] || []
        const isSelected = currentStudents.includes(student.id)

        if (isSelected) {
            // Allow removing student
            setPointStudents({
                ...pointStudents,
                [currentPoint.id]: currentStudents.filter(id => id !== student.id)
            })
            setCapacityError(null) // Clear error when removing
        } else {
            // Check if adding would exceed capacity
            if (totalAssignedStudents >= maxStudents) {
                setCapacityError(`Đã đạt giới hạn ${maxStudents} học sinh! (Sức chứa xe: ${vehicleCapacity} - 2 chỗ cho tài xế và phụ xe)`)
                // Auto-clear error after 5 seconds
                setTimeout(() => setCapacityError(null), 5000)
                return
            }

            setCapacityError(null) // Clear error on successful add
            setPointStudents({
                ...pointStudents,
                [currentPoint.id]: [...currentStudents, student.id]
            })
        }
    }

    // Check if a student is already assigned to any point
    const getStudentAssignedPoint = (studentId) => {
        for (const [pointId, studentIds] of Object.entries(pointStudents)) {
            if (studentIds.includes(studentId)) {
                return points.find(p => p.id === parseInt(pointId))
            }
        }
        return null
    }

    // Navigate between points
    const handleNextPoint = () => {
        if (currentPointIndex < selectedPoints.length - 1) {
            const nextIndex = currentPointIndex + 1
            setCurrentPointIndex(nextIndex)
            const nextPoint = selectedPoints[nextIndex]
            setFlyTo([parseFloat(nextPoint.latitude), parseFloat(nextPoint.longitude)])
        }
    }

    const handlePrevPoint = () => {
        if (currentPointIndex > 0) {
            const prevIndex = currentPointIndex - 1
            setCurrentPointIndex(prevIndex)
            const prevPoint = selectedPoints[prevIndex]
            setFlyTo([parseFloat(prevPoint.latitude), parseFloat(prevPoint.longitude)])
        }
    }

    // Submit
    const handleSubmit = async () => {
        try {
            setSubmitting(true)

            // Build request data
            const data = {
                points: selectedPoints.map(point => ({
                    id: point.id,
                    students: pointStudents[point.id] || []
                }))
            }

            await assignPointStudents(route.id, data)

            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Error assigning students:', error)
            alert(error.response?.data?.message || 'Có lỗi xảy ra!')
        } finally {
            setSubmitting(false)
        }
    }

    // Get current point
    const currentPoint = selectedPoints[currentPointIndex]

    // Get students for current point
    const currentPointStudentIds = currentPoint ? (pointStudents[currentPoint.id] || []) : []

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
                    </Box>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationIcon color="primary" />
                    <Box>
                        <Typography variant="h6">Gán điểm dừng cho lộ trình</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {route?.name}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Stepper */}
                <Stepper activeStep={step} sx={{ mb: 3 }}>
                    <Step>
                        <StepLabel>Chọn điểm dừng ({selectedPoints.length})</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>
                            Gán học sinh ({totalAssignedStudents}/{maxStudents})
                        </StepLabel>
                    </Step>
                </Stepper>

                {/* Step 0: Select Points */}
                {step === 0 && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>Hướng dẫn:</strong> Click vào các điểm dừng trên bản đồ để thêm vào lộ trình.
                            <br />
                            • 🏫 <strong style={{ color: 'red' }}>Marker đỏ</strong> = Trường học (điểm xuất phát & kết thúc)
                            <br />
                            • 📍 <strong style={{ color: 'green' }}>Marker xanh</strong> = Điểm dừng đã chọn
                            <br />
                            • 🛣️ <strong style={{ color: '#FF6B00' }}>Đường cam</strong> = Lộ trình thực tế: Trường → Điểm 1 → Điểm 2 → ... → Trường
                        </Alert>

                        <Box sx={{ display: 'flex', gap: 2, height: 600 }}>
                            {/* Points List */}
                            <Paper elevation={2} sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Điểm dừng đã chọn ({selectedPoints.length})
                                    </Typography>
                                </Box>
                                <List sx={{ flex: 1, overflow: 'auto' }} dense>
                                    {selectedPoints.length === 0 ? (
                                        <ListItem>
                                            <ListItemText
                                                primary="Chưa chọn điểm dừng nào"
                                                secondary="Click vào điểm trên bản đồ"
                                            />
                                        </ListItem>
                                    ) : (
                                        selectedPoints.map((point, index) => (
                                            <ListItem key={point.id}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: 'success.main', width: 28, height: 28 }}>
                                                        {index + 1}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={point.address}
                                                    secondary={`${point.type === 1 ? 'Điểm dừng' : 'Điểm phụ'}`}
                                                />
                                            </ListItem>
                                        ))
                                    )}
                                </List>
                            </Paper>

                            {/* Map */}
                            <Box sx={{ flex: 1, position: 'relative' }}>
                                <MapContainer
                                    center={defaultCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%', borderRadius: 8 }}
                                >
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {points.map((point) => {
                                        const isSelected = selectedPoints.find(p => p.id === point.id)
                                        const orderIndex = selectedPoints.findIndex(p => p.id === point.id)

                                        return (
                                            <Marker
                                                key={point.id}
                                                position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                                                icon={isSelected ? selectedPointIcon : pointIcon}
                                                eventHandlers={{ click: () => handlePointClick(point) }}
                                            >
                                                <Popup>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {isSelected ? `#${orderIndex + 1} ` : ''}{point.address}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {point.type === 1 ? 'Điểm dừng' : 'Điểm phụ'}
                                                    </Typography>
                                                    <Chip
                                                        label={isSelected ? 'Đã chọn' : 'Click để chọn'}
                                                        size="small"
                                                        color={isSelected ? 'success' : 'default'}
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Popup>
                                            </Marker>
                                        )
                                    })}

                                    {/* School marker */}
                                    <Marker position={[schoolLocation.lat, schoolLocation.lng]} icon={schoolIcon}>
                                        <Popup>
                                            <Typography variant="subtitle2" fontWeight="bold" color="error">
                                                🏫 Trường học
                                            </Typography>
                                            <Typography variant="body2">Điểm xuất phát & kết thúc</Typography>
                                        </Popup>
                                    </Marker>

                                    {/* Route path polyline - use real route if available, fallback to straight line */}
                                    {realRoute && realRoute.length > 1 ? (
                                        <Polyline
                                            positions={realRoute}
                                            color="#FF6B00"
                                            weight={6}
                                            opacity={1}
                                        />
                                    ) : straightRoutePath.length > 1 && (
                                        <Polyline
                                            positions={straightRoutePath}
                                            color="#FF9800"
                                            weight={4}
                                            opacity={0.8}
                                            dashArray="10, 5"
                                        />
                                    )}
                                </MapContainer>

                                {/* Route Info Overlay */}
                                {(routeInfo || loadingRoute) && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            bgcolor: 'white',
                                            p: 1.5,
                                            borderRadius: 2,
                                            boxShadow: 2,
                                            zIndex: 1000,
                                        }}
                                    >
                                        {loadingRoute ? (
                                            <Typography variant="body2" color="primary">
                                                ⏳ Đang tính toán...
                                            </Typography>
                                        ) : routeInfo && (
                                            <>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    📍 Thông tin lộ trình
                                                </Typography>
                                                <Typography variant="body2">
                                                    🛣️ Khoảng cách: <strong>{formatDistance(routeInfo.distance)}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    ⏱️ Thời gian: <strong>{formatDuration(routeInfo.duration)}</strong>
                                                </Typography>
                                                <Typography variant="body2">
                                                    📍 Số điểm dừng: <strong>{selectedPoints.length}</strong>
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Step 1: Assign Students */}
                {step === 1 && currentPoint && (
                    <Box>
                        <Alert severity={remainingCapacity <= 3 ? "warning" : "info"} sx={{ mb: 2 }}>
                            <strong>Điểm dừng {currentPointIndex + 1}/{selectedPoints.length}:</strong> {currentPoint.address}
                            <br />
                            Click vào học sinh trên bản đồ để thêm vào điểm dừng này.
                            <br />
                            <strong>Sức chứa:</strong> {totalAssignedStudents}/{maxStudents} học sinh
                            {remainingCapacity > 0
                                ? <span style={{ color: 'green' }}> (còn {remainingCapacity} chỗ)</span>
                                : <span style={{ color: 'red' }}> (đã đầy)</span>
                            }
                        </Alert>

                        {/* Capacity Error Alert */}
                        {capacityError && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                onClose={() => setCapacityError(null)}
                            >
                                {capacityError}
                            </Alert>
                        )}

                        {/* Point Navigation */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handlePrevPoint}
                                disabled={currentPointIndex === 0}
                            >
                                Điểm trước
                            </Button>
                            <Chip
                                label={`Điểm ${currentPointIndex + 1} / ${selectedPoints.length}`}
                                color="primary"
                            />
                            <Button
                                variant="outlined"
                                endIcon={<ArrowForwardIcon />}
                                onClick={handleNextPoint}
                                disabled={currentPointIndex === selectedPoints.length - 1}
                            >
                                Điểm sau
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, height: 550 }}>
                            {/* Students List for current point */}
                            <Paper elevation={2} sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ p: 1.5, bgcolor: 'success.main', color: 'white' }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                        HS tại điểm này ({currentPointStudentIds.length})
                                    </Typography>
                                </Box>
                                <List sx={{ flex: 1, overflow: 'auto' }} dense>
                                    {currentPointStudentIds.length === 0 ? (
                                        <ListItem>
                                            <ListItemText
                                                primary="Chưa có học sinh"
                                                secondary="Click HS trên bản đồ"
                                            />
                                        </ListItem>
                                    ) : (
                                        currentPointStudentIds.map(studentId => {
                                            const student = students.find(s => s.id === studentId)
                                            if (!student) return null
                                            return (
                                                <ListItemButton
                                                    key={studentId}
                                                    onClick={() => handleStudentClick(student)}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ bgcolor: 'orange', width: 28, height: 28 }}>
                                                            <PersonIcon fontSize="small" />
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={student.full_name || student.name}
                                                        secondary={student.address || '-'}
                                                    />
                                                </ListItemButton>
                                            )
                                        })
                                    )}
                                </List>

                                <Divider />

                                {/* Summary of all points */}
                                <Box sx={{ p: 1, bgcolor: 'grey.100', maxHeight: 150, overflow: 'auto' }}>
                                    <Typography variant="caption" fontWeight="bold">Tổng quan:</Typography>
                                    {selectedPoints.map((point, idx) => (
                                        <Box key={point.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                            <Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>
                                                {idx + 1}. {point.address}
                                            </Typography>
                                            <Chip
                                                label={pointStudents[point.id]?.length || 0}
                                                size="small"
                                                color={idx === currentPointIndex ? 'success' : 'default'}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>

                            {/* Map */}
                            <Box sx={{ flex: 1 }}>
                                <MapContainer
                                    center={[parseFloat(currentPoint.latitude), parseFloat(currentPoint.longitude)]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%', borderRadius: 8 }}
                                >
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <FlyToLocation position={flyTo} zoom={15} />

                                    {/* Current point marker */}
                                    <Marker
                                        position={[parseFloat(currentPoint.latitude), parseFloat(currentPoint.longitude)]}
                                        icon={selectedPointIcon}
                                    >
                                        <Popup>
                                            <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                                📍 Điểm dừng #{currentPointIndex + 1}
                                            </Typography>
                                            <Typography variant="body2">{currentPoint.address}</Typography>
                                        </Popup>
                                    </Marker>
                                    <Circle
                                        center={[parseFloat(currentPoint.latitude), parseFloat(currentPoint.longitude)]}
                                        radius={200}
                                        pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.1 }}
                                    />

                                    {/* Student markers */}
                                    {students.map((student) => {
                                        const isSelectedForCurrent = currentPointStudentIds.includes(student.id)
                                        const assignedPoint = getStudentAssignedPoint(student.id)
                                        const isAssignedElsewhere = assignedPoint && assignedPoint.id !== currentPoint.id

                                        return (
                                            <Marker
                                                key={student.id}
                                                position={[parseFloat(student.latitude), parseFloat(student.longitude)]}
                                                icon={isSelectedForCurrent ? selectedStudentIcon : studentIcon}
                                                eventHandlers={{
                                                    click: () => !isAssignedElsewhere && handleStudentClick(student)
                                                }}
                                                opacity={isAssignedElsewhere ? 0.4 : 1}
                                            >
                                                <Popup>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {student.full_name || student.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {student.address || '-'}
                                                    </Typography>
                                                    {isAssignedElsewhere ? (
                                                        <Chip
                                                            label={`Đã gán cho điểm ${selectedPoints.findIndex(p => p.id === assignedPoint.id) + 1}`}
                                                            size="small"
                                                            color="warning"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label={isSelectedForCurrent ? 'Đã chọn ✓' : 'Click để thêm'}
                                                            size="small"
                                                            color={isSelectedForCurrent ? 'success' : 'primary'}
                                                            sx={{ mt: 1 }}
                                                        />
                                                    )}
                                                </Popup>
                                            </Marker>
                                        )
                                    })}
                                </MapContainer>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={submitting}>
                    Hủy
                </Button>

                {step === 0 && (
                    <Button
                        variant="contained"
                        onClick={handleNextToStudents}
                        disabled={selectedPoints.length === 0}
                        endIcon={<ArrowForwardIcon />}
                    >
                        Tiếp tục gán học sinh
                    </Button>
                )}

                {step === 1 && (
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => setStep(0)}
                            startIcon={<ArrowBackIcon />}
                        >
                            Quay lại chọn điểm
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit}
                            disabled={submitting || totalAssignedStudents === 0}
                            startIcon={submitting ? <CircularProgress size={20} /> : <CheckIcon />}
                        >
                            {submitting ? 'Đang lưu...' : `Hoàn thành (${totalAssignedStudents} HS)`}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default RoutePointAssigner
