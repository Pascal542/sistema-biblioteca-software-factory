import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import React from 'react';
import './styles/App.css';

// Lazy loading para todos los componentes
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const CreateMaterialRequest = React.lazy(() => import('./pages/CreateMaterialRequest'));
const MyRequests = React.lazy(() => import('./pages/MyRequests'));
const AvailableMaterials = React.lazy(() => import('./pages/AvailableMaterials'));
const ClientLoans = React.lazy(() => import('./pages/ClientLoans'));
const LoanedMaterials = React.lazy(() => import('./pages/LoanedMaterials'));
const MaterialRequests = React.lazy(() => import('./pages/MaterialRequests'));
const OrderedMaterials = React.lazy(() => import('./pages/OrderedMaterials'));
const RevistaRequests = React.lazy(() => import('./pages/RevistaRequests'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminTools = React.lazy(() => import('./pages/AdminTools'));
const MaterialsManagement = React.lazy(() => import('./pages/MaterialsManagement'));
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'));
const Dashboard = React.lazy(() => import('./pages/UserDashboard'));

// Componente de loading mejorado
const LoadingSpinner = () => (
  <div className="loading-container d-flex justify-content-center align-items-center min-vh-100">
    <div className="text-center">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="text-muted">Cargando aplicación...</p>
    </div>
  </div>
);

// Componente para asegurar la carga de iconos
const IconLoader = ({ children }: { children: React.ReactNode }) => {
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    // Verificar si Bootstrap Icons está cargado
    const checkBootstrapIcons = () => {
      const testElement = document.createElement('i');
      testElement.className = 'bi bi-house';
      testElement.style.visibility = 'hidden';
      testElement.style.position = 'absolute';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement, '::before');
      const isLoaded = computedStyle.content !== 'none' && computedStyle.content !== '';
      
      document.body.removeChild(testElement);
      return isLoaded;
    };

    // Verificar si Font Awesome está cargado
    const checkFontAwesome = () => {
      const testElement = document.createElement('i');
      testElement.className = 'fas fa-home';
      testElement.style.visibility = 'hidden';
      testElement.style.position = 'absolute';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement, '::before');
      const isLoaded = computedStyle.fontFamily && computedStyle.fontFamily.includes('Font Awesome');
      
      document.body.removeChild(testElement);
      return isLoaded;
    };

    const checkIcons = () => {
      if (checkBootstrapIcons() || checkFontAwesome()) {
        setIconsLoaded(true);
      } else {
        setTimeout(checkIcons, 100);
      }
    };

    // Esperar un poco para que las fuentes se carguen
    setTimeout(checkIcons, 200);
  }, []);

  if (!iconsLoaded) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <IconLoader>
            <Suspense fallback={<LoadingSpinner />}>
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
            </Suspense>
          </IconLoader>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;