import { useBackendNotifications } from '@/features/Notification/hooks/useBackendNotifications';
import backward from '@/assets/icons/backward.png';
import { useBackButton } from '@/widgets/layouts/hooks/BackWardHook';
import useModalStore from '@/widgets/model/Notification';
import Modal from '@/widgets/Notification/ui/Modal';
import BackendNotificationItem from '@/widgets/Notification/ui/BackendNotificationItem';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { onClick: goBack } = useBackButton();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useBackendNotifications();
  const { user: _user } = useCurrentUser();

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50">
      <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            onClick={goBack}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <span className="text-lg font-bold">알림</span>
        </div>
      </div>
      <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />
      <div className="mt-[16px] flex w-full items-center justify-between px-[28px]">
        <p className="text-xs text-gray-400">
          이전 달부터 이번 달까지의 알림을 표시합니다.
        </p>
        <span
          onClick={async () => { await markAllAsRead(); }}
          className="shrink-0 cursor-pointer text-tiny text-darkGray underline"
        >
          모두 읽음
        </span>
      </div>
      <div className="mt-[12px] w-full px-[28px]">
        {notifications.map((n) => (
          <BackendNotificationItem
            key={n.id}
            notification={n}
            onClick={() => markAsRead(n.id, n.type)}
            onDelete={() => deleteNotification(n.id, n.type)}
          />
        ))}
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
