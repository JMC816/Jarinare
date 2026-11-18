/**
 * @role: widgets — 어드민 라우트 보호
 * @rule: 미로그인 → /admin/login, adminRole 없음·권한 없음 → /admin/access-denied
 */
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const AdminGuard = ({ children, permission }: { children: React.ReactNode; permission?: string }) => {
  const { user, isLoading, isPending, isLoggedIn } = useCurrentUser();

  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (isPending || isLoading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!user.adminRole) return <Navigate to="/admin/access-denied" replace />;

  if (permission) {
    if (!user.permissions.includes(permission)) return <Navigate to="/admin/access-denied" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
