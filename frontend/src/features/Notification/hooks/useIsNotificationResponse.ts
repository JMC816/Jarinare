import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

export const useIsNotificationResponse = () => {
  const { user } = useCurrentUser();

  return {
    notifiChange: user?.notifiChange ?? false,
    notifResponse: user?.notifResponse ?? false,
  };
};
