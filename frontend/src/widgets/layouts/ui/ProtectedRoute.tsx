import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) {
    return <Navigate to={'/auth/login'} replace />;
  }
  return children;
};

export default ProtectedRoute;
