import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Students from './pages/Students'
import Accounts from './pages/Accounts'
import Vehicles from './pages/Vehicles'
import RoutesPage from './pages/Routes'
import BusStops from './pages/BusStops'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />

      <Route path="/" element={
        isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="students" element={<Students />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="bus-stops" element={<BusStops />} />
      </Route>
    </Routes>
  )
}

export default App

