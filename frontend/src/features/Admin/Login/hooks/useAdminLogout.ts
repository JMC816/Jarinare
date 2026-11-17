/**
 * @role: features/hooks — 어드민 로그아웃 처리
 * @rule: 토큰 제거·캐시 초기화·리다이렉트만 담당
 */
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const useAdminLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = async () => {
    await backendClient.post('/oauth/logout').catch(() => {});
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    queryClient.clear();
    navigate('/admin/login');
  };

  return { logout };
};
