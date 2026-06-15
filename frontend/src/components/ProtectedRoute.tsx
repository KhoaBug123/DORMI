import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireKYC?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireKYC = false }: ProtectedRouteProps) {
  const { isAuthenticated, role, user } = useAuthStore();

  if (!isAuthenticated) {
    // Chưa đăng nhập thì chuyển hướng sang /login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Sai vai trò thì chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  if (requireKYC && role === 'landlord' && user?.isVerified === false) {
    // Chủ trọ chưa KYC thì chuyển sang trang /kyc
    return <Navigate to="/kyc" replace />;
  }

  return <>{children}</>;
}
