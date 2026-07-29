/**
 * @role: widgets — PC 알림 오른쪽 사이드바
 * @rule: 렌더링만 담당, 사이드바 열림/닫힘은 notificationSidebarStore로 제어
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import { useIsReadFollowNotification } from '@/features/Follow/hooks/useIsReadFollowNotification';
import useNotifiModalStore from '@/widgets/model/Notification';
import { AcceptResponse } from '@/widgets/Notification/ui/acceptResponse';
import AcceptModal from '@/widgets/Notification/ui/AcceptModal';
import ResponseModal from '@/widgets/Notification/ui/ResponseModal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';
import { RefuseResponse } from '@/widgets/Notification/ui/refuseResponse';
import FollowNotification from '@/widgets/Notification/ui/FollowNotification';
import BoardPostNotification from '@/widgets/Notification/ui/BoardPostNotification';
import { Timestamp } from 'firebase/firestore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { useNavigate } from 'react-router-dom';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';
import { useIsReadNotification } from '@/features/Notification/hooks/useIsReadNotification';
import SwipeToDelete from '@/widgets/Notification/ui/SwipeToDelete';
import { ref, remove } from 'firebase/database';
import useNotificationSidebarStore from '../model/notificationSidebarStore';

const PCNotificationSidebar = () => {
  const { isOpen, close } = useNotificationSidebarStore();
  const navigate = useNavigate();
  const { isShow, modalType } = useNotifiModalStore();
  const { response } = useChangeResponse();
  const { refuseResponse, acceptResponse } = useIsAcceptResponse();
  const { readStartTime } = useReadStartTime();
  const {
    updateChangeResponse,
    updateAcceptResponse,
    updateRefuseResponse,
    updateStartTimeResponse,
    updateAllResponse,
  } = useIsReadNotification();
  const {
    followNotifications,
    topFollowerNotifications,
    followPostNotifications,
    updateFollowResponse,
    updateTopFollowerResponse,
    updateFollowPostResponse,
    updateAllFollowResponse,
  } = useIsReadFollowNotification();

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={close} />
      )}

      {/* 사이드바 패널 */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col bg-gray-100 transition-transform duration-300 ${
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

        {/* 모두 읽음 */}
        <div className="flex justify-end px-4 pt-3">
          <span
            onClick={async () => {
              await updateAllResponse();
              await updateAllFollowResponse();
              close();
            }}
            className="cursor-pointer text-tiny text-darkGray underline"
          >
            모두 읽음
          </span>
        </div>

        {/* 알림 목록 */}
        <div className="mt-2 flex-1 overflow-y-auto px-1 pb-6 pt-3">
          {topFollowerNotifications &&
            Object.keys(topFollowerNotifications.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(
                      realtimeDb,
                      `${auth.currentUser?.uid}_topFollower/${key}`,
                    ),
                  )
                }
              >
                <BoardPostNotification
                  type="topFollower"
                  posterName={
                    topFollowerNotifications.val()[key].posterName as string
                  }
                  postDocId={
                    topFollowerNotifications.val()[key].postDocId as
                      | string
                      | null
                  }
                  createdAt={
                    topFollowerNotifications.val()[key].createdAt as number
                  }
                  isRead={topFollowerNotifications.val()[key].isRead as boolean}
                  onClick={async () => await updateTopFollowerResponse(key)}
                  onNavigate={() => {
                    const posterUid = topFollowerNotifications.val()[key]
                      .posterUid as string;
                    const postDocId = topFollowerNotifications.val()[key]
                      .postDocId as string;
                    navigate('/board/board/detail', {
                      state: {
                        post: { id: `boards/${posterUid}/board/${postDocId}` },
                      },
                    });
                  }}
                />
              </SwipeToDelete>
            ))}
          {followPostNotifications &&
            Object.keys(followPostNotifications.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(
                      realtimeDb,
                      `${auth.currentUser?.uid}_followPost/${key}`,
                    ),
                  )
                }
              >
                <BoardPostNotification
                  type="followPost"
                  posterName={
                    followPostNotifications.val()[key].posterName as string
                  }
                  createdAt={
                    followPostNotifications.val()[key].createdAt as number
                  }
                  isRead={followPostNotifications.val()[key].isRead as boolean}
                  onClick={async () => await updateFollowPostResponse(key)}
                />
              </SwipeToDelete>
            ))}
          {followNotifications &&
            Object.keys(followNotifications.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(realtimeDb, `${auth.currentUser?.uid}_follow/${key}`),
                  )
                }
              >
                <FollowNotification
                  followerName={
                    followNotifications.val()[key].followerName as string
                  }
                  createdAt={followNotifications.val()[key].createdAt as number}
                  isRead={followNotifications.val()[key].isRead as boolean}
                  onClick={async () => await updateFollowResponse(key)}
                />
              </SwipeToDelete>
            ))}
          {readStartTime &&
            Object.keys(readStartTime.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(
                      realtimeDb,
                      `${auth.currentUser?.uid}_startTime/${key}`,
                    ),
                  )
                }
              >
                <StartTimeNotification
                  createdAt={readStartTime.val()[key].createdAt as Timestamp}
                  seats={readStartTime.val()[key].seats as SeatType[]}
                  isRead={readStartTime.val()[key].isRead as boolean}
                  onClick={async () => await updateStartTimeResponse(key)}
                />
              </SwipeToDelete>
            ))}
          {response &&
            Object.keys(response.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(realtimeDb, `${auth.currentUser?.uid}_change/${key}`),
                  )
                }
              >
                <NotificationRequest
                  requestTitle="좌석 변경"
                  requstTime={response.val()[key].createdAt as Timestamp}
                  requsetContant={response.val()[key].mySeat as SeatType[]}
                  isRead={response.val()[key].isRead as boolean}
                  onClick={async () => await updateChangeResponse(key)}
                  requestPath={`${auth.currentUser?.uid}_change/${key}`}
                />
              </SwipeToDelete>
            ))}
          {acceptResponse &&
            Object.keys(acceptResponse.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(realtimeDb, `${auth.currentUser?.uid}_accept/${key}`),
                  )
                }
              >
                <AcceptResponse
                  responseTitle={acceptResponse.val()[key].text as string}
                  responseTime={
                    acceptResponse.val()[key].createdAt as Timestamp
                  }
                  responseContant={
                    acceptResponse.val()[key].targetSeats as SeatType[]
                  }
                  responseDeleteContant={
                    acceptResponse.val()[key].mySeats as SeatType[]
                  }
                  isRead={acceptResponse.val()[key].isRead as boolean}
                  onClick={async () => await updateAcceptResponse(key)}
                />
              </SwipeToDelete>
            ))}
          {refuseResponse &&
            Object.keys(refuseResponse.val()).map((key) => (
              <SwipeToDelete
                key={key}
                onDelete={() =>
                  remove(
                    ref(realtimeDb, `${auth.currentUser?.uid}_refuse/${key}`),
                  )
                }
              >
                <RefuseResponse
                  responseTitle={refuseResponse.val()[key].text as string}
                  responseTime={
                    refuseResponse.val()[key].createdAt as Timestamp
                  }
                  responseContant={
                    refuseResponse.val()[key].targetSeats as SeatType[]
                  }
                  responseDeleteContant={
                    refuseResponse.val()[key].mySeats as SeatType[]
                  }
                  isRead={refuseResponse.val()[key].isRead as boolean}
                  onClick={async () => await updateRefuseResponse(key)}
                />
              </SwipeToDelete>
            ))}
        </div>
      </aside>

      {isShow && modalType ? (
        <div className="fixed inset-0 z-[60]">
          {modalType === 'ResponseModal' && <ResponseModal centered />}
          {modalType === 'AcceptModal' && <AcceptModal centered />}
        </div>
      ) : null}
    </>
  );
};

export default PCNotificationSidebar;
