import { auth } from '@/shared/firebase/firebase';
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = auth.currentUser;
  if (user === null) {
    // 사용자 정보가 없으면 로그인 페이지로 이동
    return <Navigate to={'/auth/login'} />;
  }
  return children;
};

export default ProtectedRoute;
