import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Employees from './pages/Employees'
import Students from './pages/Students'
import Parents from './pages/Parents'
import Accounts from './pages/Accounts'
import Vehicles from './pages/Vehicles'
import RoutesPage from './pages/Routes'
import Points from './pages/Points'

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token')

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/employees" replace /> : <Login />
      } />

      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/employees" replace />} />
        <Route path="employees" element={<Employees />} />
        <Route path="students" element={<Students />} />
        <Route path="parents" element={<Parents />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="points" element={<Points />} />
      </Route>
    </Routes>
  )
}

export default App
