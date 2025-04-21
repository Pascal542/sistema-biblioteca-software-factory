import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  element: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles = [] }) => {
  const { user, isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(role || '')) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{element}</>;
};

export default ProtectedRoute;