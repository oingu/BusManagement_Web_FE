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
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    TextField,
    Grid,
    Slider,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    MenuItem,
    LinearProgress,
} from '@mui/material'
import {
    AutoAwesome as AutoIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    DirectionsBus as BusIcon,
    Route as RouteIcon,
    Check as CheckIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    ExpandMore as ExpandMoreIcon,
    School as SchoolIcon,
    Settings as SettingsIcon,
    Save as SaveIcon,
} from '@mui/icons-material'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
    getAllStudents,
    getAllVehicles,
    getAllDrivers,
    runClustering,
    runVRP,
    createPoint,
    createRoute,
    assignPointStudents
} from '../services/api'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const createNumberedIcon = (number, color) => {
    return L.divIcon({
        className: 'custom-numbered-marker',
        html: `<div style="
            background-color: ${color};
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">${number}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    })
}

// Student marker (blue)
const studentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
})

// School marker icon (red)
const schoolIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [35, 57],
    iconAnchor: [17, 57],
    popupAnchor: [1, -45],
    shadowSize: [57, 57],
})

// Cluster colors for different clusters
const clusterColors = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63',
    '#00BCD4', '#795548', '#607D8B', '#F44336', '#3F51B5',
    '#CDDC39', '#673AB7', '#009688', '#FFC107', '#8BC34A',
]

// Route colors
const routeColors = [
    '#1565C0', '#2E7D32', '#EF6C00', '#7B1FA2', '#C62828',
    '#00838F', '#4E342E', '#37474F', '#D84315', '#283593',
]

const AutoRouteGenerator = ({ open, onClose, onSuccess }) => {
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState(null)

    // Data
    const [students, setStudents] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])
    const [attendants, setAttendants] = useState([])

    // Configuration
    const [config, setConfig] = useState({
        Rmax: 0.5, // km - bán kính tối đa để gom nhóm học sinh
        vehicleCapacity: 30, // sức chứa mỗi xe
        maxVehicles: 10, // số xe tối đa
        depotLat: 21.0285, // Vị trí trường học
        depotLng: 105.8542,
        depotName: 'Trường học',
    })

    // Results
    const [clusteringResult, setClusteringResult] = useState(null)
    const [vrpResult, setVrpResult] = useState(null)

    // Step 3: Route assignments (vehicle, driver, assistant for each route)
    const [routeAssignments, setRouteAssignments] = useState([])
    const [createdTrips, setCreatedTrips] = useState([])
    const [creationProgress, setCreationProgress] = useState({ current: 0, total: 0, status: '' })

    // School location
    const schoolLocation = { lat: config.depotLat, lng: config.depotLng }
    const defaultCenter = [schoolLocation.lat, schoolLocation.lng]

    useEffect(() => {
        if (open) {
            fetchData()
            resetState()
        }
    }, [open])

    const resetState = () => {
        setStep(0)
        setError(null)
        setClusteringResult(null)
        setVrpResult(null)
        setRouteAssignments([])
        setCreatedTrips([])
        setCreationProgress({ current: 0, total: 0, status: '' })
        setProcessing(false)
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [studentsRes, vehiclesRes, driversRes] = await Promise.all([
                getAllStudents(),
                getAllVehicles(),
                getAllDrivers(),
            ])

            const studentsData = studentsRes.data.data || studentsRes.data || []
            const vehiclesData = vehiclesRes.data.data || vehiclesRes.data || []
            const driversData = driversRes.data.data || driversRes.data || []

            // Filter students with valid coordinates
            const validStudents = studentsData.filter(s => {
                const lat = parseFloat(s.latitude)
                const lng = parseFloat(s.longitude)
                return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
            })

            setStudents(validStudents)
            setVehicles(vehiclesData)

            // Separate drivers (position=1) and attendants (position=2)
            setDrivers(driversData.filter(e => e.position === 1))
            setAttendants(driversData.filter(e => e.position === 2))

            // Auto-set vehicle capacity if available
            if (vehiclesData.length > 0) {
                const avgCapacity = Math.round(
                    vehiclesData.reduce((sum, v) => sum + (v.capacity || 30), 0) / vehiclesData.length
                )
                setConfig(prev => ({
                    ...prev,
                    vehicleCapacity: avgCapacity,
                    maxVehicles: vehiclesData.length,
                }))
            }

        } catch (error) {
            console.error('Error fetching data:', error)
            setError('Không thể tải dữ liệu. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    // Step 1: Run Clustering
    const handleRunClustering = async () => {
        if (students.length === 0) {
            setError('Không có học sinh nào để phân nhóm.')
            return
        }

        try {
            setProcessing(true)
            setError(null)

            const clusteringData = {
                students: students.map(s => ({
                    id: s.id,
                    lat: parseFloat(s.latitude),
                    lon: parseFloat(s.longitude),
                })),
                must_link: [],
                cannot_link: [],
                Rmax: config.Rmax,
            }

            console.log('Clustering request:', clusteringData)
            const response = await runClustering(clusteringData)
            console.log('Clustering response:', response.data)

            setClusteringResult(response.data)
            setStep(1)

        } catch (error) {
            console.error('Clustering error:', error)
            setError(error.response?.data?.detail || error.response?.data?.message || 'Lỗi khi phân nhóm học sinh.')
        } finally {
            setProcessing(false)
        }
    }

    // Step 2: Run VRP
    const handleRunVRP = async () => {
        if (!clusteringResult || !clusteringResult.pickup_points) {
            setError('Chưa có kết quả phân nhóm. Vui lòng thực hiện bước 1 trước.')
            return
        }

        try {
            setProcessing(true)
            setError(null)

            const vrpData = {
                pickup_points: clusteringResult.pickup_points,
                depot: {
                    lat: config.depotLat,
                    lon: config.depotLng,
                    name: config.depotName,
                },
                vehicle_capacity: config.vehicleCapacity,
                max_vehicles: config.maxVehicles,
            }

            console.log('VRP request:', vrpData)
            const response = await runVRP(vrpData)
            console.log('VRP response:', response.data)

            setVrpResult(response.data)

            // Initialize route assignments with default values
            const initialAssignments = response.data.routes.map((route, idx) => ({
                routeIndex: idx,
                vehicleId: route.vehicle_id,
                name: `Lộ trình ${idx + 1} - Tự động`,
                vehicle_id: vehicles[idx]?.id || '',
                driver_id: drivers[idx]?.id || '',
                assistant_id: attendants[idx]?.id || '',
                type: 0, // Đón sáng
                start_time: '07:00',
                end_time: '08:30',
                total_students: route.total_students,
                stops: route.stops,
                // Ngày hoạt động trong tuần
                is_mon: true,
                is_tue: true,
                is_wed: true,
                is_thu: true,
                is_fri: true,
                is_sat: false,
            }))
            setRouteAssignments(initialAssignments)

            setStep(2)

        } catch (error) {
            console.error('VRP error:', error)
            setError(error.response?.data?.detail || error.response?.data?.message || 'Lỗi khi tối ưu lộ trình.')
        } finally {
            setProcessing(false)
        }
    }

    // Step 3: Create actual routes in database
    const handleCreateRoutes = async () => {
        // Validate all assignments
        for (let i = 0; i < routeAssignments.length; i++) {
            const assignment = routeAssignments[i]
            if (!assignment.vehicle_id || !assignment.driver_id || !assignment.assistant_id) {
                setError(`Vui lòng chọn đầy đủ xe, tài xế và phụ xe cho Lộ trình ${i + 1}`)
                return
            }
        }

        try {
            setProcessing(true)
            setError(null)
            setCreatedTrips([])

            // Calculate total steps: create points + create trips + assign students
            const totalPickupPoints = clusteringResult.pickup_points.length
            const totalSteps = totalPickupPoints + routeAssignments.length * 2
            let currentStep = 0

            setCreationProgress({ current: 0, total: totalSteps, status: 'Đang tạo điểm dừng...' })

            // Step 1: Create all pickup points first and store mapping
            const pickupIdToPointId = {} // Map from cluster pickup_id to database point id

            for (const pickup of clusteringResult.pickup_points) {
                currentStep++
                setCreationProgress({
                    current: currentStep,
                    total: totalSteps,
                    status: `Đang tạo điểm dừng ${currentStep}/${totalPickupPoints}...`
                })

                const pointData = {
                    address: `Điểm đón tự động #${pickup.pickup_id + 1}`,
                    latitude: pickup.lat.toString(),
                    longitude: pickup.lon.toString(),
                    type: 1, // Điểm dừng chính
                    status: 1, // Hoạt động
                }

                try {
                    console.log(`Creating point for pickup ${pickup.pickup_id}:`, pointData)
                    const pointResponse = await createPoint(pointData)
                    const createdPoint = pointResponse.data.data || pointResponse.data
                    console.log(`Point created:`, createdPoint)

                    pickupIdToPointId[pickup.pickup_id] = createdPoint.id
                } catch (pointError) {
                    console.error(`Error creating point for pickup ${pickup.pickup_id}:`, pointError)
                    throw new Error(`Không thể tạo điểm dừng #${pickup.pickup_id + 1}`)
                }
            }

            console.log('Pickup to Point ID mapping:', pickupIdToPointId)

            // Step 2: Create trips and assign students
            const createdTripsList = []

            for (let i = 0; i < routeAssignments.length; i++) {
                const assignment = routeAssignments[i]
                currentStep++
                setCreationProgress({
                    current: currentStep,
                    total: totalSteps,
                    status: `Đang tạo lộ trình ${i + 1}/${routeAssignments.length}...`
                })

                // Create trip
                const tripData = {
                    name: assignment.name,
                    driver_id: parseInt(assignment.driver_id),
                    assistant_id: parseInt(assignment.assistant_id),
                    vehicle_id: parseInt(assignment.vehicle_id),
                    total_students: assignment.total_students,
                    curr_students: 0,
                    type: assignment.type,
                    status: 0, // Chưa bắt đầu
                    start_time: assignment.start_time || '07:00',
                    end_time: assignment.end_time || '08:30',
                    is_mon: assignment.is_mon ?? false,
                    is_tue: assignment.is_tue ?? false,
                    is_wed: assignment.is_wed ?? false,
                    is_thu: assignment.is_thu ?? false,
                    is_fri: assignment.is_fri ?? false,
                    is_sat: assignment.is_sat ?? false,
                }

                console.log(`Creating trip ${i + 1}:`, tripData)
                const tripResponse = await createRoute(tripData)
                const createdTrip = tripResponse.data.data || tripResponse.data
                console.log(`Trip ${i + 1} created:`, createdTrip)

                // Step 3: Assign students to points for this trip
                currentStep++
                setCreationProgress({
                    current: currentStep,
                    total: totalSteps,
                    status: `Đang gán học sinh cho lộ trình ${i + 1}...`
                })

                // Build point-students assignment data with correct format
                // Format: { points: [{ id: pointId, students: [studentId1, studentId2, ...] }] }
                const pointsData = {
                    points: assignment.stops.map(stopId => {
                        const pointId = pickupIdToPointId[stopId]
                        const studentIds = clusteringResult.assignment
                            .filter(a => a.cluster_id === stopId)
                            .map(a => a.student_id)

                        return {
                            id: pointId,
                            students: studentIds,
                        }
                    }).filter(p => p.id) // Only include points that were successfully created
                }

                try {
                    console.log(`Assigning students to trip ${createdTrip.id}:`, pointsData)
                    await assignPointStudents(createdTrip.id, pointsData)
                    console.log(`Students assigned to trip ${createdTrip.id}`)
                } catch (assignError) {
                    console.error(`Error assigning students to trip ${createdTrip.id}:`, assignError)
                    // Continue with other trips even if assignment fails
                }

                createdTripsList.push({
                    ...createdTrip,
                    assignment: assignment,
                    pointsCreated: assignment.stops.map(s => pickupIdToPointId[s]),
                    success: true,
                })
            }

            setCreatedTrips(createdTripsList)
            setCreationProgress({
                current: totalSteps,
                total: totalSteps,
                status: 'Hoàn thành!'
            })
            setStep(3)

        } catch (error) {
            console.error('Create routes error:', error)
            setError(error.response?.data?.message || error.response?.data?.detail || error.message || 'Lỗi khi tạo lộ trình.')
        } finally {
            setProcessing(false)
        }
    }

    // Update route assignment
    const updateAssignment = (index, field, value) => {
        setRouteAssignments(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    // Get cluster ID for a student
    const getStudentClusterId = (studentId) => {
        if (!clusteringResult) return null
        const assignment = clusteringResult.assignment.find(a => a.student_id === studentId)
        return assignment ? assignment.cluster_id : null
    }

    // Get pickup point for a cluster
    const getPickupPointByCluster = (clusterId) => {
        if (!clusteringResult) return null
        return clusteringResult.pickup_points.find(p => p.pickup_id === clusterId)
    }

    // Get students in a cluster
    const getStudentsInCluster = (clusterId) => {
        if (!clusteringResult) return []
        const studentIds = clusteringResult.assignment
            .filter(a => a.cluster_id === clusterId)
            .map(a => a.student_id)
        return students.filter(s => studentIds.includes(s.id))
    }

    // Get route info with pickup points
    const getRouteWithPickups = (route) => {
        if (!clusteringResult) return { ...route, pickups: [] }
        const pickups = route.stops.map(stopId =>
            clusteringResult.pickup_points.find(p => p.pickup_id === stopId)
        ).filter(Boolean)
        return { ...route, pickups }
    }

    // Render Step 0: Configuration
    const renderConfigStep = () => (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    🤖 Tự động tạo lộ trình
                </Typography>
                <Typography variant="body2">
                    Hệ thống sẽ tự động:
                    <br />• <strong>Bước 1:</strong> Gom nhóm học sinh gần nhau thành các điểm đón
                    <br />• <strong>Bước 2:</strong> Tối ưu hóa lộ trình cho các xe
                    <br />• <strong>Bước 3:</strong> Tạo lộ trình thực tế và gán học sinh
                </Typography>
            </Alert>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SettingsIcon color="primary" /> Cấu hình phân nhóm
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Typography gutterBottom>
                                    Bán kính gom nhóm (Rmax): <strong>{config.Rmax} km</strong>
                                </Typography>
                                <Slider
                                    value={config.Rmax}
                                    min={0.1}
                                    max={2}
                                    step={0.1}
                                    onChange={(e, v) => setConfig({ ...config, Rmax: v })}
                                    marks={[
                                        { value: 0.1, label: '100m' },
                                        { value: 0.5, label: '500m' },
                                        { value: 1, label: '1km' },
                                        { value: 2, label: '2km' },
                                    ]}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Học sinh trong bán kính này sẽ được gom vào cùng một điểm đón
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusIcon color="primary" /> Cấu hình xe
                            </Typography>

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Sức chứa mỗi xe"
                                        value={config.vehicleCapacity}
                                        onChange={(e) => setConfig({ ...config, vehicleCapacity: parseInt(e.target.value) || 1 })}
                                        InputProps={{ inputProps: { min: 1, max: 100 } }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Số xe tối đa"
                                        value={config.maxVehicles}
                                        onChange={(e) => setConfig({ ...config, maxVehicles: parseInt(e.target.value) || 1 })}
                                        InputProps={{ inputProps: { min: 1, max: vehicles.length || 20 } }}
                                    />
                                </Grid>
                            </Grid>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Có {vehicles.length} xe, {drivers.length} tài xế, {attendants.length} phụ xe trong hệ thống
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon color="primary" /> Vị trí trường học (Điểm xuất phát)
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        label="Tên trường"
                                        value={config.depotName}
                                        onChange={(e) => setConfig({ ...config, depotName: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Vĩ độ (Latitude)"
                                        value={config.depotLat}
                                        onChange={(e) => setConfig({ ...config, depotLat: parseFloat(e.target.value) })}
                                        InputProps={{ inputProps: { step: 0.0001 } }}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Kinh độ (Longitude)"
                                        value={config.depotLng}
                                        onChange={(e) => setConfig({ ...config, depotLng: parseFloat(e.target.value) })}
                                        InputProps={{ inputProps: { step: 0.0001 } }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                        <Typography variant="h6">
                            📊 Thống kê dữ liệu
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={3}>
                                <Typography variant="h4">{students.length}</Typography>
                                <Typography variant="body2">Học sinh có tọa độ hợp lệ</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="h4">{vehicles.length}</Typography>
                                <Typography variant="body2">Phương tiện có sẵn</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="h4">{drivers.length}</Typography>
                                <Typography variant="body2">Tài xế</Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography variant="h4">{attendants.length}</Typography>
                                <Typography variant="body2">Phụ xe</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )

    // Render Step 1: Clustering Result
    const renderClusteringStep = () => (
        <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    ✅ Phân nhóm thành công!
                </Typography>
                <Typography variant="body2">
                    Đã tạo <strong>{clusteringResult.num_clusters}</strong> điểm đón cho <strong>{students.length}</strong> học sinh.
                </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, height: 500 }}>
                {/* Cluster List */}
                <Paper elevation={2} sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 1.5, bgcolor: 'primary.main', color: 'white' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            📍 Điểm đón ({clusteringResult.num_clusters})
                        </Typography>
                    </Box>
                    <List sx={{ flex: 1, overflow: 'auto' }} dense>
                        {clusteringResult.pickup_points.map((point, idx) => {
                            const studentsInCluster = getStudentsInCluster(point.pickup_id)
                            return (
                                <Accordion key={point.pickup_id} disableGutters>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: clusterColors[idx % clusterColors.length],
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: 14,
                                                }}
                                            >
                                                {idx + 1}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    Điểm đón #{point.pickup_id + 1}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {point.num_students} học sinh
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: 'grey.50', p: 1 }}>
                                        <Typography variant="caption" gutterBottom>
                                            📍 Tọa độ: {point.lat.toFixed(4)}, {point.lon.toFixed(4)}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        {studentsInCluster.map(s => (
                                            <Chip
                                                key={s.id}
                                                label={s.full_name || s.name}
                                                size="small"
                                                sx={{ m: 0.25 }}
                                            />
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })}
                    </List>
                </Paper>

                {/* Map */}
                <Box sx={{ flex: 1 }}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%', borderRadius: 8 }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* School marker */}
                        <Marker position={[schoolLocation.lat, schoolLocation.lng]} icon={schoolIcon}>
                            <Popup>
                                <Typography variant="subtitle2" fontWeight="bold" color="error">
                                    🏫 {config.depotName}
                                </Typography>
                                <Typography variant="body2">Điểm xuất phát & kết thúc</Typography>
                            </Popup>
                        </Marker>

                        {/* Pickup points */}
                        {clusteringResult.pickup_points.map((point, idx) => (
                            <Marker
                                key={point.pickup_id}
                                position={[point.lat, point.lon]}
                                icon={createNumberedIcon(idx + 1, clusterColors[idx % clusterColors.length])}
                            >
                                <Popup>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        📍 Điểm đón #{point.pickup_id + 1}
                                    </Typography>
                                    <Typography variant="body2">
                                        Số học sinh: {point.num_students}
                                    </Typography>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Students with cluster colors */}
                        {students.map((student) => {
                            const clusterId = getStudentClusterId(student.id)
                            const clusterIdx = clusteringResult.pickup_points.findIndex(p => p.pickup_id === clusterId)
                            return (
                                <Circle
                                    key={student.id}
                                    center={[parseFloat(student.latitude), parseFloat(student.longitude)]}
                                    radius={30}
                                    pathOptions={{
                                        color: clusterColors[clusterIdx % clusterColors.length] || '#999',
                                        fillColor: clusterColors[clusterIdx % clusterColors.length] || '#999',
                                        fillOpacity: 0.7,
                                    }}
                                >
                                    <Popup>
                                        <Typography variant="body2" fontWeight="bold">
                                            {student.full_name || student.name}
                                        </Typography>
                                        <Typography variant="caption">
                                            Điểm đón: #{clusterId + 1}
                                        </Typography>
                                    </Popup>
                                </Circle>
                            )
                        })}
                    </MapContainer>
                </Box>
            </Box>
        </Box>
    )

    // Render Step 2: VRP Result with Route Assignment
    const renderVRPStep = () => (
        <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    ✅ Tối ưu lộ trình thành công!
                </Typography>
                <Typography variant="body2">
                    Đã tạo <strong>{vrpResult.num_vehicles}</strong> lộ trình cho {clusteringResult.num_clusters} điểm đón.
                    <br />
                    <strong>Tiếp theo:</strong> Chọn xe, tài xế, phụ xe cho từng lộ trình rồi nhấn "Tạo lộ trình".
                </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, height: 550 }}>
                {/* Route Assignment Form */}
                <Paper elevation={2} sx={{ width: 450, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 1.5, bgcolor: 'success.main', color: 'white' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            🚌 Gán xe & nhân viên ({vrpResult.num_vehicles} lộ trình)
                        </Typography>
                    </Box>
                    <List sx={{ flex: 1, overflow: 'auto', p: 1 }} dense>
                        {routeAssignments.map((assignment, idx) => {
                            const route = vrpResult.routes[idx]
                            return (
                                <Accordion key={idx} defaultExpanded={idx === 0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: routeColors[idx % routeColors.length],
                                                    width: 32,
                                                    height: 32,
                                                }}
                                            >
                                                <BusIcon fontSize="small" />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    Lộ trình {idx + 1}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {route.total_students} HS | {route.stops.length} điểm
                                                </Typography>
                                            </Box>
                                            {assignment.vehicle_id && assignment.driver_id && assignment.assistant_id ? (
                                                <CheckIcon color="success" fontSize="small" />
                                            ) : (
                                                <Chip label="Chưa đủ" size="small" color="warning" />
                                            )}
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Tên lộ trình"
                                                    value={assignment.name}
                                                    onChange={(e) => updateAssignment(idx, 'name', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    select
                                                    label="Phương tiện *"
                                                    value={assignment.vehicle_id}
                                                    onChange={(e) => updateAssignment(idx, 'vehicle_id', e.target.value)}
                                                >
                                                    {vehicles.map(v => (
                                                        <MenuItem key={v.id} value={v.id}>
                                                            {v.plate_number} ({v.capacity} chỗ)
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    select
                                                    label="Tài xế *"
                                                    value={assignment.driver_id}
                                                    onChange={(e) => updateAssignment(idx, 'driver_id', e.target.value)}
                                                >
                                                    {drivers.map(d => (
                                                        <MenuItem key={d.id} value={d.id}>
                                                            {d.full_name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    select
                                                    label="Phụ xe *"
                                                    value={assignment.assistant_id}
                                                    onChange={(e) => updateAssignment(idx, 'assistant_id', e.target.value)}
                                                >
                                                    {attendants.map(a => (
                                                        <MenuItem key={a.id} value={a.id}>
                                                            {a.full_name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    select
                                                    label="Loại lộ trình"
                                                    value={assignment.type}
                                                    onChange={(e) => updateAssignment(idx, 'type', e.target.value)}
                                                >
                                                    <MenuItem value={0}>Đón sáng</MenuItem>
                                                    <MenuItem value={1}>Trả chiều</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="time"
                                                    label="Bắt đầu"
                                                    value={assignment.start_time}
                                                    onChange={(e) => updateAssignment(idx, 'start_time', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    type="time"
                                                    label="Kết thúc"
                                                    value={assignment.end_time}
                                                    onChange={(e) => updateAssignment(idx, 'end_time', e.target.value)}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Điểm dừng: {route.stops.map(s => `#${s + 1}`).join(' → ')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="caption" fontWeight="bold" sx={{ mb: 0.5, display: 'block' }}>
                                                    Ngày hoạt động:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {[
                                                        { key: 'is_mon', label: 'T2' },
                                                        { key: 'is_tue', label: 'T3' },
                                                        { key: 'is_wed', label: 'T4' },
                                                        { key: 'is_thu', label: 'T5' },
                                                        { key: 'is_fri', label: 'T6' },
                                                        { key: 'is_sat', label: 'T7' },
                                                    ].map(day => (
                                                        <Chip
                                                            key={day.key}
                                                            label={day.label}
                                                            size="small"
                                                            color={assignment[day.key] ? 'primary' : 'default'}
                                                            variant={assignment[day.key] ? 'filled' : 'outlined'}
                                                            onClick={() => updateAssignment(idx, day.key, !assignment[day.key])}
                                                            sx={{
                                                                cursor: 'pointer',
                                                                minWidth: 36,
                                                                '&:hover': {
                                                                    opacity: 0.8,
                                                                }
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })}
                    </List>
                </Paper>

                {/* Map */}
                <Box sx={{ flex: 1 }}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%', borderRadius: 8 }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* School marker */}
                        <Marker position={[schoolLocation.lat, schoolLocation.lng]} icon={schoolIcon}>
                            <Popup>
                                <Typography variant="subtitle2" fontWeight="bold" color="error">
                                    🏫 {config.depotName}
                                </Typography>
                            </Popup>
                        </Marker>

                        {/* Route lines */}
                        {vrpResult.routes.map((route, routeIdx) => {
                            const routePath = [[schoolLocation.lat, schoolLocation.lng]]
                            route.stops.forEach(stopId => {
                                const pickup = clusteringResult.pickup_points.find(p => p.pickup_id === stopId)
                                if (pickup) {
                                    routePath.push([pickup.lat, pickup.lon])
                                }
                            })
                            routePath.push([schoolLocation.lat, schoolLocation.lng])

                            return (
                                <Polyline
                                    key={route.vehicle_id}
                                    positions={routePath}
                                    color={routeColors[routeIdx % routeColors.length]}
                                    weight={4}
                                    opacity={0.8}
                                />
                            )
                        })}

                        {/* Pickup points */}
                        {clusteringResult.pickup_points.map((point, idx) => (
                            <Marker
                                key={point.pickup_id}
                                position={[point.lat, point.lon]}
                                icon={createNumberedIcon(idx + 1, clusterColors[idx % clusterColors.length])}
                            >
                                <Popup>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        📍 Điểm đón #{point.pickup_id + 1}
                                    </Typography>
                                    <Typography variant="body2">
                                        Số học sinh: {point.num_students}
                                    </Typography>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Box>
            </Box>

            {/* Progress bar during creation */}
            {processing && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                        {creationProgress.status}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={(creationProgress.current / creationProgress.total) * 100}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {creationProgress.current} / {creationProgress.total}
                    </Typography>
                </Box>
            )}
        </Box>
    )

    // Render Step 3: Creation Result
    const renderCreationResultStep = () => (
        <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    🎉 Tạo lộ trình thành công!
                </Typography>
                <Typography variant="body2">
                    Đã tạo <strong>{createdTrips.length}</strong> lộ trình và gán học sinh vào các điểm dừng.
                </Typography>
            </Alert>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Lộ trình</TableCell>
                            <TableCell>Xe</TableCell>
                            <TableCell>Tài xế</TableCell>
                            <TableCell>Phụ xe</TableCell>
                            <TableCell align="center">Số HS</TableCell>
                            <TableCell align="center">Số điểm dừng</TableCell>
                            <TableCell align="center">Trạng thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {createdTrips.map((trip, idx) => {
                            const vehicle = vehicles.find(v => v.id === parseInt(trip.assignment.vehicle_id))
                            const driver = drivers.find(d => d.id === parseInt(trip.assignment.driver_id))
                            const assistant = attendants.find(a => a.id === parseInt(trip.assignment.assistant_id))

                            return (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <Chip
                                            icon={<BusIcon />}
                                            label={trip.assignment.name}
                                            sx={{ bgcolor: routeColors[idx % routeColors.length], color: 'white' }}
                                        />
                                    </TableCell>
                                    <TableCell>{vehicle?.plate_number || '-'}</TableCell>
                                    <TableCell>{driver?.full_name || '-'}</TableCell>
                                    <TableCell>{assistant?.full_name || '-'}</TableCell>
                                    <TableCell align="center">{trip.assignment.total_students}</TableCell>
                                    <TableCell align="center">{trip.assignment.stops.length}</TableCell>
                                    <TableCell align="center">
                                        {trip.success ? (
                                            <Chip label="Thành công" size="small" color="success" />
                                        ) : (
                                            <Chip label="Lỗi" size="small" color="error" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Paper sx={{ mt: 2, p: 2, bgcolor: 'info.light' }}>
                <Typography variant="body2">
                    💡 <strong>Lưu ý:</strong> Các lộ trình đã được tạo với trạng thái "Chưa bắt đầu".
                    Bạn có thể vào trang Quản lý Lộ trình để chỉnh sửa chi tiết và kích hoạt các lộ trình.
                </Typography>
            </Paper>
        </Box>
    )

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
                    <AutoIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" fontWeight="bold">
                            Tự động tạo lộ trình
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gán học sinh cho điểm dừng & Tối ưu lộ trình xe bus
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Stepper */}
                <Stepper activeStep={step} sx={{ mb: 3 }}>
                    <Step>
                        <StepLabel>
                            <Box>
                                Cấu hình
                                <Typography variant="caption" display="block" color="text.secondary">
                                    Thiết lập tham số
                                </Typography>
                            </Box>
                        </StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>
                            <Box>
                                Phân nhóm
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {clusteringResult ? `${clusteringResult.num_clusters} điểm đón` : 'Clustering'}
                                </Typography>
                            </Box>
                        </StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>
                            <Box>
                                Tối ưu & Gán
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {vrpResult ? `${vrpResult.num_vehicles} xe` : 'VRP'}
                                </Typography>
                            </Box>
                        </StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>
                            <Box>
                                Hoàn thành
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {createdTrips.length > 0 ? `${createdTrips.length} lộ trình` : 'Tạo lộ trình'}
                                </Typography>
                            </Box>
                        </StepLabel>
                    </Step>
                </Stepper>

                {/* Step Content */}
                {step === 0 && renderConfigStep()}
                {step === 1 && renderClusteringStep()}
                {step === 2 && renderVRPStep()}
                {step === 3 && renderCreationResultStep()}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={processing}>
                    {step === 3 ? 'Đóng' : 'Hủy'}
                </Button>

                {step === 0 && (
                    <Button
                        variant="contained"
                        onClick={handleRunClustering}
                        disabled={processing || students.length === 0}
                        startIcon={processing ? <CircularProgress size={20} /> : <LocationIcon />}
                    >
                        {processing ? 'Đang xử lý...' : 'Bước 1: Phân nhóm học sinh'}
                    </Button>
                )}

                {step === 1 && (
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => setStep(0)}
                            startIcon={<ArrowBackIcon />}
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleRunVRP}
                            disabled={processing}
                            startIcon={processing ? <CircularProgress size={20} /> : <RouteIcon />}
                        >
                            {processing ? 'Đang xử lý...' : 'Bước 2: Tối ưu lộ trình'}
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => setStep(1)}
                            startIcon={<ArrowBackIcon />}
                            disabled={processing}
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleCreateRoutes}
                            disabled={processing}
                            startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
                        >
                            {processing ? 'Đang tạo...' : 'Bước 3: Tạo lộ trình'}
                        </Button>
                    </>
                )}

                {step === 3 && (
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                            onSuccess?.({
                                clustering: clusteringResult,
                                vrp: vrpResult,
                                createdTrips,
                                config,
                            })
                            onClose()
                        }}
                        startIcon={<CheckIcon />}
                    >
                        Hoàn thành
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default AutoRouteGenerator
