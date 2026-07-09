import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import backward from '@/assets/icons/backward.png';
import { useBackButton } from '@/widgets/layouts/hooks/BackWardHook';
import useModalStore from '@/widgets/model/Notification';
import { AcceptResponse } from '@/widgets/Notification/ui/acceptResponse';
import Modal from '@/widgets/Notification/ui/Modal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';
import { RefuseResponse } from '@/widgets/Notification/ui/refuseResponse';
import { Timestamp } from 'firebase/firestore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import setting from '@/assets/icons/setting.png';
import { Link } from 'react-router-dom';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';
import { useIsReadNotification } from '@/features/Notification/hooks/useIsReadNotification';
import SwipeToDelete from '@/widgets/Notification/ui/SwipeToDelete';
import { ref, remove } from 'firebase/database';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { onClick: goBack } = useBackButton();
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
      <span
        onClick={async () => await updateAllResponse()}
        className="mt-[20px] flex w-full cursor-pointer justify-end pr-[10px] text-tiny text-darkGray underline"
      >
        모두 읽음
      </span>
      <div className="mt-[5px] w-full">
        {readStartTime &&
          Object.keys(readStartTime.val()).map((key) => (
            <SwipeToDelete
              key={key}
              onDelete={() =>
                remove(
                  ref(realtimeDb, `${auth.currentUser?.uid}_startTime/${key}`),
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
                responseTime={acceptResponse.val()[key].createdAt as Timestamp}
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
                responseTime={refuseResponse.val()[key].createdAt as Timestamp}
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
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
