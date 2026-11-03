// @role: features/Auth
// @rule: 단일 권한 코드 보유 여부만 반환, 로직 포함 금지
import { useCurrentUser } from './useCurrentUser';

export const useHasPermission = (permission: string): boolean => {
  const { user } = useCurrentUser();
  return user?.permissions?.includes(permission) ?? false;
};
