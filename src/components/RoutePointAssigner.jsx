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
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAllPoints, getAllStudents, assignPointStudents } from '../services/api'

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

    const defaultCenter = [21.0285, 105.8542]

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
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const [pointsRes, studentsRes] = await Promise.all([
                getAllPoints(), // Use /points/all API
                getAllStudents(),
            ])

            const pointsData = pointsRes.data.data || pointsRes.data || []
            const studentsData = studentsRes.data.data || studentsRes.data || []

            console.log('All points:', pointsData)
            console.log('All students:', studentsData)

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
            setPointStudents({
                ...pointStudents,
                [currentPoint.id]: currentStudents.filter(id => id !== student.id)
            })
        } else {
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

    // Calculate total assigned students
    const totalAssignedStudents = Object.values(pointStudents).reduce((sum, ids) => sum + ids.length, 0)

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
                        <StepLabel>Gán học sinh ({totalAssignedStudents})</StepLabel>
                    </Step>
                </Stepper>

                {/* Step 0: Select Points */}
                {step === 0 && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Click vào các điểm dừng trên bản đồ để thêm vào lộ trình. Thứ tự chọn sẽ là thứ tự điểm dừng.
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
                            <Box sx={{ flex: 1 }}>
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
                                </MapContainer>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Step 1: Assign Students */}
                {step === 1 && currentPoint && (
                    <Box>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <strong>Điểm dừng {currentPointIndex + 1}/{selectedPoints.length}:</strong> {currentPoint.address}
                            <br />
                            Click vào học sinh trên bản đồ để thêm vào điểm dừng này.
                        </Alert>

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
