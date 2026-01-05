import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Typography, Chip, CircularProgress, Alert, Paper } from '@mui/material'
import { getTripPoints } from '../services/api'
import { calculateRoute, formatDistance, formatDuration } from '../services/routingService'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// School marker (red)
const schoolIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
})

// Create numbered point icon
const createNumberedPointIcon = (number) => {
    return L.divIcon({
        className: 'custom-numbered-icon',
        html: `
            <div style="position: relative;">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" 
                     style="width: 30px; height: 49px;" />
                <div style="
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 12px;
                    color: #333;
                    border: 2px solid #4caf50;
                ">${number}</div>
            </div>
        `,
        iconSize: [30, 49],
        iconAnchor: [15, 49],
        popupAnchor: [1, -40],
    })
}

// Component to fit bounds
function FitBounds({ points, schoolLocation }) {
    const map = useMap()

    useEffect(() => {
        const bounds = []
        bounds.push([schoolLocation.lat, schoolLocation.lng])
        points.forEach(p => {
            if (p.latitude && p.longitude) {
                bounds.push([parseFloat(p.latitude), parseFloat(p.longitude)])
            }
        })
        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [50, 50] })
        }
    }, [points, schoolLocation, map])

    return null
}

const TripRouteMap = ({
    tripId,
    schoolLocation = { lat: 21.0285, lng: 105.8542 }, // Default: Hanoi
    height = '600px',
}) => {
    const [points, setPoints] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [realRoute, setRealRoute] = useState(null)
    const [routeInfo, setRouteInfo] = useState(null)
    const [loadingRoute, setLoadingRoute] = useState(false)

    useEffect(() => {
        if (tripId) {
            fetchTripPoints()
        }
    }, [tripId])

    const fetchTripPoints = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getTripPoints(tripId)

            // API returns array directly: [{ id, address, type, order, latitude, longitude }]
            let pointsData = []
            if (Array.isArray(response.data)) {
                pointsData = response.data
            } else if (response.data.values) {
                pointsData = response.data.values
            } else if (response.data.data) {
                pointsData = response.data.data
            }

            console.log('Trip points response:', pointsData)

            // Sort by order and filter valid coordinates
            const sortedPoints = pointsData
                .filter(p => {
                    const lat = parseFloat(p.latitude)
                    const lng = parseFloat(p.longitude)
                    const isValid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
                    if (!isValid) {
                        console.warn('Point without valid coordinates:', p)
                    }
                    return isValid
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))

            console.log('Valid points for route:', sortedPoints)
            setPoints(sortedPoints)

            if (sortedPoints.length === 0 && pointsData.length > 0) {
                console.warn('All points have invalid coordinates')
            }
        } catch (err) {
            console.error('Error fetching trip points:', err)
            setError('Không thể tải điểm dừng của lộ trình')
        } finally {
            setLoading(false)
        }
    }

    // Calculate route path: School -> Points -> School
    useEffect(() => {
        const fetchRealRoute = async () => {
            if (points.length === 0) {
                setRealRoute(null)
                setRouteInfo(null)
                return
            }

            setLoadingRoute(true)

            try {
                // Build waypoints: School -> Points -> School
                const waypoints = []

                // Start at school
                waypoints.push([schoolLocation.lng, schoolLocation.lat])

                // Add all points in order
                points.forEach(point => {
                    if (point.latitude && point.longitude) {
                        waypoints.push([parseFloat(point.longitude), parseFloat(point.latitude)])
                    }
                })

                // Return to school
                waypoints.push([schoolLocation.lng, schoolLocation.lat])

                if (waypoints.length < 2) {
                    setRealRoute(null)
                    setRouteInfo(null)
                    return
                }

                const result = await calculateRoute(waypoints)

                if (result.success) {
                    // Convert coordinates từ [lng, lat] sang [lat, lng] cho Leaflet
                    const leafletCoordinates = result.coordinates.map(coord => [coord[1], coord[0]])
                    setRealRoute(leafletCoordinates)
                    setRouteInfo({
                        distance: result.distance,
                        duration: result.duration,
                    })
                } else {
                    // Fallback to straight lines
                    const straightPath = [
                        [schoolLocation.lat, schoolLocation.lng],
                        ...points.filter(p => p.latitude && p.longitude)
                            .map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]),
                        [schoolLocation.lat, schoolLocation.lng],
                    ]
                    setRealRoute(straightPath)
                    setRouteInfo(null)
                }
            } catch (err) {
                console.error('Error calculating route:', err)
                // Fallback to straight lines
                const straightPath = [
                    [schoolLocation.lat, schoolLocation.lng],
                    ...points.filter(p => p.latitude && p.longitude)
                        .map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]),
                    [schoolLocation.lat, schoolLocation.lng],
                ]
                setRealRoute(straightPath)
            } finally {
                setLoadingRoute(false)
            }
        }

        fetchRealRoute()
    }, [points, schoolLocation])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Đang tải lộ trình...</Typography>
            </Box>
        )
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        )
    }

    return (
        <Box sx={{ position: 'relative' }}>
            {/* Points List */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip label="🏫 Trường" color="error" size="small" />
                {points.map((point, index) => (
                    <Chip
                        key={point.id}
                        label={`${index + 1}. ${point.address}`}
                        color="success"
                        size="small"
                        variant="outlined"
                    />
                ))}
                <Chip label="🏫 Trường" color="error" size="small" />
            </Box>

            <MapContainer
                center={[schoolLocation.lat, schoolLocation.lng]}
                zoom={13}
                style={{ height, width: '100%', borderRadius: '8px' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds points={points} schoolLocation={schoolLocation} />

                {/* School marker */}
                <Marker position={[schoolLocation.lat, schoolLocation.lng]} icon={schoolIcon}>
                    <Popup>
                        <Typography variant="subtitle2" fontWeight="bold" color="error">
                            🏫 Trường học
                        </Typography>
                        <Typography variant="body2">Điểm xuất phát & kết thúc</Typography>
                    </Popup>
                </Marker>

                {/* Point markers */}
                {points.map((point, index) => (
                    <Marker
                        key={point.id}
                        position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
                        icon={createNumberedPointIcon(index + 1)}
                    >
                        <Popup>
                            <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                📍 Điểm dừng #{index + 1}
                            </Typography>
                            <Typography variant="body2">{point.address}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {point.type === 1 ? 'Điểm dừng chính' : 'Điểm phụ'}
                            </Typography>
                        </Popup>
                    </Marker>
                ))}

                {/* Route polyline */}
                {realRoute && realRoute.length > 1 && (
                    <Polyline
                        positions={realRoute}
                        color="#1976d2"
                        weight={4}
                        opacity={0.8}
                    />
                )}
            </MapContainer>

            {/* Route Info */}
            {routeInfo && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: 60,
                        right: 10,
                        zIndex: 1000,
                        p: 2,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        📍 Thông tin lộ trình
                    </Typography>
                    <Typography variant="body2">
                        🛣️ Khoảng cách: <strong>{formatDistance(routeInfo.distance)}</strong>
                    </Typography>
                    <Typography variant="body2">
                        ⏱️ Thời gian: <strong>{formatDuration(routeInfo.duration)}</strong>
                    </Typography>
                    <Typography variant="body2">
                        📍 Số điểm dừng: <strong>{points.length}</strong>
                    </Typography>
                    {loadingRoute && (
                        <Typography variant="caption" color="primary">
                            Đang tính toán...
                        </Typography>
                    )}
                </Paper>
            )}

            {points.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Lộ trình này chưa có điểm dừng nào. Hãy gán điểm dừng trước.
                </Alert>
            )}
        </Box>
    )
}

export default TripRouteMap
