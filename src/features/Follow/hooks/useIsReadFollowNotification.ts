/**
 * @role: features — 팔로우 관련 알림 읽음 상태 처리
 * @rule: features/Follow 내부 훅만 사용, 타 features 참조 금지
 */
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { ref, update } from 'firebase/database';
import { useFollowNotification } from './useFollowNotification';
import { useTopFollowerNotification } from './useTopFollowerNotification';
import { useFollowPostNotification } from './useFollowPostNotification';

export const useIsReadFollowNotification = () => {
  const { followNotifications } = useFollowNotification();
  const { topFollowerNotifications } = useTopFollowerNotification();
  const { followPostNotifications } = useFollowPostNotification();
  const user = auth.currentUser;

  const updateFollowResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_follow/${key}`), {
      isRead: true,
    });
  };

  const updateTopFollowerResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_topFollower/${key}`), {
      isRead: true,
    });
  };

  const updateFollowPostResponse = async (key: string) => {
    if (!user) return;
    await update(ref(realtimeDb, `${user.uid}_followPost/${key}`), {
      isRead: true,
    });
  };

  const updateAllFollowResponse = async () => {
    if (!user) return;

    if (followNotifications?.exists()) {
      await Promise.all(
        Object.keys(followNotifications.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_follow/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
    if (topFollowerNotifications?.exists()) {
      await Promise.all(
        Object.keys(topFollowerNotifications.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_topFollower/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
    if (followPostNotifications?.exists()) {
      await Promise.all(
        Object.keys(followPostNotifications.val()).map((key) =>
          update(ref(realtimeDb, `${user.uid}_followPost/${key}`), {
            isRead: true,
          }),
        ),
      );
    }
  };

  return {
    followNotifications,
    topFollowerNotifications,
    followPostNotifications,
    updateFollowResponse,
    updateTopFollowerResponse,
    updateFollowPostResponse,
    updateAllFollowResponse,
  };
};
