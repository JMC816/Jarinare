import { backendClient } from '@/shared/api/backendClient';
import { useQueryClient } from '@tanstack/react-query';

export const useIsNotification = () => {
  const queryClient = useQueryClient();

  const updateIsChange = async (notifiChange: boolean) => {
    await backendClient.patch('/api/users/me/notification-settings', { notifiChange });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  const updateIsResponse = async (notifResponse: boolean) => {
    await backendClient.patch('/api/users/me/notification-settings', { notifResponse });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  return { updateIsChange, updateIsResponse };
};
