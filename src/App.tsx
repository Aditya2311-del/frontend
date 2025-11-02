import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PatientDashboard } from './pages/patient/Dashboard';
import { CheckIn } from './pages/patient/CheckIn';
import { PatientProfile } from './pages/patient/Profile';
import { PatientInsights } from './pages/patient/Insights';
import { DoctorDashboard } from './pages/doctor/Dashboard';
import { DoctorPatients } from './pages/doctor/Patients';
import { PatientDetail } from './pages/doctor/PatientDetail';

const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/patient/dashboard" replace /> : <Signup />}
      />
      
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/checkin"
        element={
          <ProtectedRoute requiredRole="patient">
            <CheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/insights"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientInsights />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:patientId"
        element={
          <ProtectedRoute requiredRole="doctor">
            <PatientDetail />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

