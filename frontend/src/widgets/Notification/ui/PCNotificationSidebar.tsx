/**
 * @role: widgets — PC 알림 오른쪽 사이드바
 * @rule: 렌더링만 담당, 사이드바 열림/닫힘은 notificationSidebarStore로 제어
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { useBackendNotifications } from '@/features/Notification/hooks/useBackendNotifications';
import BackendNotificationItem from './BackendNotificationItem';
import useNotifiModalStore from '@/widgets/model/Notification';
import AcceptModal from '@/widgets/Notification/ui/AcceptModal';
import ExpiredModal from '@/widgets/Notification/ui/ExpiredModal';
import ResponseModal from '@/widgets/Notification/ui/ResponseModal';
import { realtimeDb } from '@/shared/firebase/firebase';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';
import { useIsReadNotification } from '@/features/Notification/hooks/useIsReadNotification';
import SwipeToDelete from '@/widgets/Notification/ui/SwipeToDelete';
import { ref, remove } from 'firebase/database';
import { sanitizeRtdbKey } from '@/shared/lib/rtdbKey';
import useNotificationSidebarStore from '../model/notificationSidebarStore';

const PCNotificationSidebar = () => {
  const { isOpen, close } = useNotificationSidebarStore();
  const { isShow, modalType } = useNotifiModalStore();
  const { readStartTime } = useReadStartTime();
  const { updateStartTimeResponse, updateAllResponse } = useIsReadNotification();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useBackendNotifications();
  const { user } = useCurrentUser();

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 z-[55] bg-black/30" onClick={close} />
      )}

      {/* 사이드바 패널 */}
      <aside
        className={`fixed right-0 top-0 z-[60] flex h-full w-[400px] flex-col bg-gray-100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <span className="text-base font-bold">알림</span>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* 안내 텍스트 */}
        <div className="px-4 pt-3">
          <p className="text-xs text-gray-400">이전 달부터 이번 달까지의 알림을 표시합니다.</p>
        </div>

        {/* 모두 읽음 */}
        <div className="flex justify-end px-4 pt-2">
          <span
            onClick={async () => {
              await updateAllResponse();
              await markAllAsRead();
              close();
            }}
            className="cursor-pointer text-tiny text-darkGray underline"
          >
            모두 읽음
          </span>
        </div>

        {/* 알림 목록 */}
        <div className="mt-2 flex-1 overflow-y-auto px-1 pb-6 pt-3">
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
                    ref(
                      realtimeDb,
                      `${sanitizeRtdbKey(user?.userId ?? '')}_startTime/${key}`,
                    ),
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
      </aside>

      {isShow && modalType ? (
        <div className="fixed inset-0 z-[70]">
          {modalType === 'ResponseModal' && <ResponseModal centered />}
          {modalType === 'AcceptModal' && <AcceptModal centered />}
          {modalType === 'ExpiredModal' && <ExpiredModal centered />}
        </div>
      ) : null}
    </>
  );
};

export default PCNotificationSidebar;
