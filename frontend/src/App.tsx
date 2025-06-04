import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminTools from './pages/AdminTools';
import MaterialRequests from './pages/MaterialRequests';
import OrderedMaterials from './pages/OrderedMaterials';
import RevistaRequests from './pages/RevistaRequests';
import ClientLoans from './pages/ClientLoans';
import AvailableMaterials from './pages/AvailableMaterials';
import LoanedMaterials from './pages/LoanedMaterials';
import Unauthorized from './pages/Unauthorized';
import CreateMaterialRequest from './pages/CreateMaterialRequest';
import MyRequests from './pages/MyRequests';
import MaterialsManagement from './pages/MaterialsManagement';
import './styles/App.css';


function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Rutas de usuario normal */}
            <Route 
              path="/user-dashboard" 
              element={<ProtectedRoute element={<Dashboard />} allowedRoles={['usuario']} />} 
            />
            <Route 
              path="/client-loans" 
              element={<ProtectedRoute element={<ClientLoans />} allowedRoles={['usuario']} />} 
            />
            <Route 
              path="/available-materials" 
              element={<ProtectedRoute element={<AvailableMaterials />} />} 
            />
            <Route 
              path="/create-request" 
              element={<ProtectedRoute element={<CreateMaterialRequest />} allowedRoles={['usuario']} />} 
            />
            <Route 
              path="/my-requests" 
              element={<ProtectedRoute element={<MyRequests />} allowedRoles={['usuario']} />} 
            />
            
            {/* Rutas de administrador */}
            <Route 
              path="/admin-dashboard" 
              element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/admin-tools" 
              element={<ProtectedRoute element={<AdminTools />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/material-requests" 
              element={<ProtectedRoute element={<MaterialRequests />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/ordered-materials" 
              element={<ProtectedRoute element={<OrderedMaterials />} allowedRoles={['admin']} />} 
            />
            <Route 
              path="/revista-requests" 
              element={<ProtectedRoute element={<RevistaRequests />} allowedRoles={['admin']} />} 
            />
            <Route
              path="/materials-management"
              element={<ProtectedRoute element={<MaterialsManagement />} allowedRoles={['admin', 'usuario']} />}
            />
            <Route 
              path="/loaned-materials" 
              element={<ProtectedRoute element={<LoanedMaterials />} allowedRoles={['admin']} />} 
            />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;