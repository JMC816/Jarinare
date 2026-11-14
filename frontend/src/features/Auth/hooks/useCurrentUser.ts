// @role: features/Auth
// @rule: JWT 기반 현재 사용자 프로필 조회
import { useQuery } from '@tanstack/react-query';
import { ACCESS_TOKEN_KEY, backendClient } from '@/shared/api/backendClient';

export type UserRole = 'user' | 'cs' | 'marketer' | 'operator' | 'super_admin';

export type AdminRole = {
  id: string;
  code: string;
  name: string;
};

export type UserProfile = {
  idx: number;
  userId: string;
  name: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  seatChageCount: number;
  point: number;
  notifiChange: boolean;
  notifResponse: boolean;
  role: UserRole;
  permissions: string[];
  adminRole: AdminRole | null;
};


export const useCurrentUser = () => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await backendClient.get<UserProfile>('/api/users/me');
      return data;
    },
    enabled: !!token,
    staleTime: Infinity,
  });

  return {
    user: token ? (user ?? null) : null,
    isLoading: !!token && isLoading,
    isLoggedIn: !!token,
  };
};
