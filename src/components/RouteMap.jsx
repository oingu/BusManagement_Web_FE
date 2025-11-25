import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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
  routePath = []
}) => {
  const mapRef = useRef()

  const isStudentSelected = (studentId) => {
    return selectedStudents.some(s => s.id === studentId)
  }

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
        
        return (
          <Marker
            key={student.id}
            position={[student.latitude, student.longitude]}
            icon={isSelected ? selectedStudentIcon : studentIcon}
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
      
      {/* Route path */}
      {routePath.length > 1 && (
        <Polyline
          positions={routePath}
          color="blue"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  )
}

export default RouteMap

