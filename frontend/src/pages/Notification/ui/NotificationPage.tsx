import { SeatType } from '@/entities/Seat/types/seatType';
import { useBackendNotifications } from '@/features/Notification/hooks/useBackendNotifications';
import backward from '@/assets/icons/backward.png';
import { useBackButton } from '@/widgets/layouts/hooks/BackWardHook';
import useModalStore from '@/widgets/model/Notification';
import Modal from '@/widgets/Notification/ui/Modal';
import BackendNotificationItem from '@/widgets/Notification/ui/BackendNotificationItem';
import { realtimeDb } from '@/shared/firebase/firebase';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import setting from '@/assets/icons/setting.png';
import { Link } from 'react-router-dom';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';
import { useIsReadNotification } from '@/features/Notification/hooks/useIsReadNotification';
import SwipeToDelete from '@/widgets/Notification/ui/SwipeToDelete';
import { ref, remove } from 'firebase/database';
import { sanitizeRtdbKey } from '@/shared/lib/rtdbKey';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { onClick: goBack } = useBackButton();
  const { readStartTime } = useReadStartTime();
  const { updateStartTimeResponse, updateAllResponse } = useIsReadNotification();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useBackendNotifications();
  const { user } = useCurrentUser();

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100">
      <div className="flex w-full items-center justify-between px-[28px] pt-[20px]">
        <div className="flex items-center gap-3">
          <img
            onClick={goBack}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <span className="text-base font-bold">알림</span>
        </div>
        <Link to={'/setting'}>
          <img width={27} height={27} src={setting} />
        </Link>
      </div>
      <p className="mt-[16px] w-full px-[10px] text-xs text-gray-400">
        이전 달부터 이번 달까지의 알림을 표시합니다.
      </p>
      <span
        onClick={async () => {
          await updateAllResponse();
          await markAllAsRead();
        }}
        className="mt-[8px] flex w-full cursor-pointer justify-end pr-[10px] text-tiny text-darkGray underline"
      >
        모두 읽음
      </span>
      <div className="mt-[5px] w-full">
        {notifications.map((n) => (
          <BackendNotificationItem
            key={n.id}
            notification={n}
            onClick={() => markAsRead(n.id, n.type)}
            onDelete={() => deleteNotification(n.id, n.type)}
          />
        ))}
        {readStartTime &&
          Object.keys(readStartTime.val()).map((key) => (
            <SwipeToDelete
              key={key}
              onDelete={() =>
                remove(
                  ref(realtimeDb, `${sanitizeRtdbKey(user?.userId ?? '')}_startTime/${key}`),
                )
              }
            >
              <StartTimeNotification
                createdAt={readStartTime.val()[key].createdAt as number}
                seats={readStartTime.val()[key].seats as SeatType[]}
                isRead={readStartTime.val()[key].isRead as boolean}
                onClick={async () => await updateStartTimeResponse(key)}
              />
            </SwipeToDelete>
          ))}
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
