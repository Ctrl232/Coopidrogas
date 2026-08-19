import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'CLIENTE';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);

  // No logueado -> a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logueado pero sin el rol requerido -> a inicio (no a login, ya está autenticado)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}