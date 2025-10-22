import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { ref, update } from 'firebase/database';
import { useChangeResponse } from './useChangeResponse';
import { useIsAcceptResponse } from './useIsAcceptResponse';
import { useReadStartTime } from './useReadStartTime';

export const useIsReadNotification = () => {
  const { response } = useChangeResponse();
  const { acceptResponse, refuseResponse } = useIsAcceptResponse();
  const { readStartTime } = useReadStartTime();
  const user = auth.currentUser;

  // 각 알림 읽음 처리 및 전체 읽음 처리
  const updateChangeResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_change/${key}`), {
      isRead: true,
    });
  };

  const updateAcceptResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_accept/${key}`), {
      isRead: true,
    });
  };

  const updateRefuseResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_refuse/${key}`), {
      isRead: true,
    });
  };

  const updateStartTimeResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_startTime/${key}`), {
      isRead: true,
    });
  };

  const updateAllResponse = async () => {
    if (!user) return;
    const changeResponseKeys = response && Object.keys(response.val());

    const acceptResponseKeys =
      acceptResponse && Object.keys(acceptResponse.val());

    const refuseResponseKeys =
      refuseResponse && Object.keys(refuseResponse.val());

    const startTimeResponseKeys =
      readStartTime && Object.keys(readStartTime.val());

    if (response?.exists) {
      await Promise.all(
        changeResponseKeys!.map(async (key) =>
          update(ref(realtimeDb, `${user.uid}_change/${key}`), {
            isRead: true,
          }),
        ),
      );
    }

    if (acceptResponse?.exists()) {
      await Promise.all(
        acceptResponseKeys!.map(async (key) =>
          update(ref(realtimeDb, `${user.uid}_accept/${key}`), {
            isRead: true,
          }),
        ),
      );
    }

    if (refuseResponse?.exists()) {
      await Promise.all(
        refuseResponseKeys!.map(async (key) =>
          update(ref(realtimeDb, `${user.uid}_refuse/${key}`), {
            isRead: true,
          }),
        ),
      );
    }

    if (readStartTime?.exists()) {
      await Promise.all(
        startTimeResponseKeys!.map(async (key) =>
          update(ref(realtimeDb, `${user.uid}_startTime/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
  };
  return {
    updateChangeResponse,
    updateAcceptResponse,
    updateRefuseResponse,
    updateStartTimeResponse,
    updateAllResponse,
  };
};
