import { auth } from '@/shared/firebase/firebase';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = auth.currentUser;
  if (user === null) {
    // 사용자 정보가 없으면 로그인 페이지로 이동 (replace로 히스토리 교체)
    return <Navigate to={'/auth/login'} replace />;
  }
  return children;
};

export default ProtectedRoute;
