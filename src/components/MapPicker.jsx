import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Typography, Alert, TextField, Button, Grid } from '@mui/material'
import { MyLocation as MyLocationIcon } from '@mui/icons-material'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker for selected location
const selectedLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      })
    },
  })

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={selectedLocationIcon} />
  ) : null
}

const MapPicker = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  address = '',
}) => {
  const [position, setPosition] = useState(null)
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const defaultCenter = [21.0285, 105.8542] // Hanoi

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: parseFloat(latitude), lng: parseFloat(longitude) })
      setManualLat(latitude.toString())
      setManualLng(longitude.toString())
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (position) {
      onLocationChange(position.lat, position.lng)
      setManualLat(position.lat.toFixed(6))
      setManualLng(position.lng.toFixed(6))
    }
  }, [position, onLocationChange])

  const handleManualUpdate = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setPosition({ lat, lng })
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Không thể lấy vị trí hiện tại. Vui lòng cho phép truy cập vị trí trong trình duyệt.')
        }
      )
    } else {
      alert('Trình duyệt không hỗ trợ định vị')
    }
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Cách sử dụng:</strong> Click trực tiếp trên bản đồ để chọn vị trí đón/trả học sinh, 
        hoặc nhập tọa độ thủ công bên dưới.
      </Alert>

      <MapContainer
        center={position ? [position.lat, position.lng] : defaultCenter}
        zoom={13}
        style={{ 
          height: '400px', 
          width: '100%', 
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {position && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Vị trí đã chọn:</strong>
            <br />
            Tọa độ: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            {address && (
              <>
                <br />
                Địa chỉ: {address}
              </>
            )}
          </Typography>
        </Alert>
      )}

      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tọa độ thủ công
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Latitude (Vĩ độ)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              type="number"
              inputProps={{ step: 'any' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Longitude (Kinh độ)"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              type="number"
              inputProps={{ step: 'any' }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleManualUpdate}
              size="small"
            >
              Cập nhật
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGetCurrentLocation}
              size="small"
              startIcon={<MyLocationIcon />}
            >
              Vị trí của tôi
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default MapPicker

