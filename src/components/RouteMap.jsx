import { useEffect, useRef, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { calculateRoute, formatDistance, formatDuration } from '../services/routingService'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for students
const studentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const schoolIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const selectedStudentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Function to create numbered marker icon
const createNumberedIcon = (number, color = 'green') => {
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `
      <div style="position: relative;">
        <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png" 
             style="width: 25px; height: 41px;" />
        <div style="
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          color: #333;
          border: 2px solid ${color === 'green' ? '#4caf50' : '#2196f3'};
        ">${number}</div>
      </div>
    `,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

// Component to fit bounds when students change
function MapBounds({ students, selectedStudents }) {
  const map = useMap()
  
  useEffect(() => {
    if (students.length > 0) {
      const bounds = students
        .filter(s => s.latitude && s.longitude)
        .map(s => [s.latitude, s.longitude])
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [students, selectedStudents, map])
  
  return null
}

const RouteMap = ({ 
  students = [], 
  selectedStudents = [], 
  onStudentClick,
  schoolLocation = { lat: 21.0285, lng: 105.8542 }, // Default: Hanoi
  routePath = [],
  showRoute = true, // Hiển thị tuyến đường tự động
  useRealRouting = true, // Sử dụng OSRM để tính tuyến đường thực tế
}) => {
  const mapRef = useRef()
  const [realRoute, setRealRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  const isStudentSelected = (studentId) => {
    return selectedStudents.some(s => s.id === studentId)
  }

  const getStudentOrderInRoute = (studentId) => {
    const index = selectedStudents.findIndex(s => s.id === studentId)
    return index >= 0 ? index + 1 : null
  }

  // Tính toán tuyến đường tự động từ các học sinh đã chọn (đường thẳng)
  const calculatedRoutePath = useMemo(() => {
    if (!showRoute || selectedStudents.length === 0) return []
    
    // Lọc các học sinh có tọa độ hợp lệ
    const validStudents = selectedStudents.filter(s => s.latitude && s.longitude)
    if (validStudents.length === 0) return []

    // Tạo mảng các điểm: Trường -> Học sinh 1 -> Học sinh 2 -> ... -> Trường
    const points = []
    
    // Điểm bắt đầu: Trường học
    points.push([schoolLocation.lat, schoolLocation.lng])
    
    // Thêm các điểm đón học sinh (theo thứ tự trong selectedStudents)
    validStudents.forEach(student => {
      points.push([student.latitude, student.longitude])
    })
    
    // Điểm kết thúc: Quay về trường (tạo vòng tròn)
    points.push([schoolLocation.lat, schoolLocation.lng])
    
    return points
  }, [selectedStudents, schoolLocation, showRoute])

  // Tính toán tuyến đường thực tế sử dụng OSRM
  useEffect(() => {
    const fetchRealRoute = async () => {
      if (!useRealRouting || !showRoute || calculatedRoutePath.length < 2) {
        setRealRoute(null)
        setRouteInfo(null)
        return
      }

      setLoadingRoute(true)

      try {
        // Convert coordinates từ [lat, lng] sang [lng, lat] cho OSRM
        const coordinates = calculatedRoutePath.map(point => [point[1], point[0]])

        const result = await calculateRoute(coordinates)

        if (result.success) {
          // Convert coordinates trả về từ [lng, lat] sang [lat, lng] cho Leaflet
          const leafletCoordinates = result.coordinates.map(coord => [coord[1], coord[0]])
          setRealRoute(leafletCoordinates)
          setRouteInfo({
            distance: result.distance,
            duration: result.duration,
          })
        } else {
          // Fallback: sử dụng đường thẳng
          setRealRoute(null)
          setRouteInfo(null)
        }
      } catch (error) {
        console.error('Error fetching real route:', error)
        setRealRoute(null)
        setRouteInfo(null)
      } finally {
        setLoadingRoute(false)
      }
    }

    fetchRealRoute()
  }, [calculatedRoutePath, useRealRouting, showRoute])

  return (
    <MapContainer
      center={[schoolLocation.lat, schoolLocation.lng]}
      zoom={13}
      style={{ height: '600px', width: '100%', borderRadius: '8px' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapBounds students={students} selectedStudents={selectedStudents} />
      
      {/* School marker */}
      <Marker position={[schoolLocation.lat, schoolLocation.lng]} icon={schoolIcon}>
        <Popup>
          <strong>Trường học</strong>
        </Popup>
      </Marker>
      
      {/* Student markers */}
      {students.map((student) => {
        if (!student.latitude || !student.longitude) return null
        
        const isSelected = isStudentSelected(student.id)
        const orderNumber = getStudentOrderInRoute(student.id)
        
        // Sử dụng icon có số thứ tự nếu học sinh đã được chọn
        const markerIcon = isSelected && orderNumber 
          ? createNumberedIcon(orderNumber, 'green')
          : isSelected 
          ? selectedStudentIcon 
          : studentIcon
        
        return (
          <Marker
            key={student.id}
            position={[student.latitude, student.longitude]}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                if (onStudentClick) {
                  onStudentClick(student)
                }
              },
            }}
          >
            <Popup>
              <div>
                <strong>{student.name}</strong>
                {orderNumber && (
                  <>
                    <br />
                    <strong style={{ color: '#4caf50' }}>Điểm đón thứ {orderNumber}</strong>
                  </>
                )}
                <br />
                Lớp: {student.className}
                <br />
                Địa chỉ: {student.address}
                <br />
                <em>{isSelected ? '✓ Đã chọn' : 'Click để chọn'}</em>
              </div>
            </Popup>
          </Marker>
        )
      })}
      
      {/* Tuyến đường thực tế từ OSRM hoặc đường thẳng fallback */}
      {showRoute && (
        <>
          {useRealRouting && realRoute && realRoute.length > 1 ? (
            // Vẽ tuyến đường thực tế từ OSRM
            <Polyline
              positions={realRoute}
              color="#1976d2"
              weight={4}
              opacity={0.8}
            />
          ) : (
            // Fallback: vẽ đường thẳng
            <>
              {calculatedRoutePath.length > 2 && (
                <>
                  {/* Đường đi đón (nét liền) */}
                  <Polyline
                    positions={calculatedRoutePath.slice(0, -1)}
                    color="#4caf50"
                    weight={3}
                    opacity={0.7}
                  />
                  {/* Đường quay về (nét đứt) */}
                  <Polyline
                    positions={[
                      calculatedRoutePath[calculatedRoutePath.length - 2],
                      calculatedRoutePath[calculatedRoutePath.length - 1]
                    ]}
                    color="#ff9800"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 5"
                  />
                </>
              )}
            </>
          )}
        </>
      )}
      
      {/* Hiển thị thông tin tuyến đường */}
      {routeInfo && useRealRouting && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '14px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            📍 Thông tin lộ trình
          </div>
          <div>🛣️ Khoảng cách: <strong>{formatDistance(routeInfo.distance)}</strong></div>
          <div>⏱️ Thời gian: <strong>{formatDuration(routeInfo.duration)}</strong></div>
          {loadingRoute && (
            <div style={{ color: '#1976d2', fontSize: '12px', marginTop: '4px' }}>
              Đang tính toán...
            </div>
          )}
        </div>
      )}
    </MapContainer>
  )
}

export default RouteMap

