/**
 * @role: features/hooks
 * @rule: 외부 데이터 호출만 담당
 */
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useGetPoint = () => {
  const { user } = useCurrentUser();
  return { point: user?.point ?? 0 };
};
