import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/Notification';
import { AcceptResponse } from '@/widgets/Notification/ui/acceptResponse';
import Modal from '@/widgets/Notification/ui/Modal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';
import { RefuseResponse } from '@/widgets/Notification/ui/refuseResponse';
import { Timestamp } from 'firebase/firestore';
import setting from '@/assets/icons/setting.png';
import { Link } from 'react-router-dom';
import StartTimeNotification from '@/widgets/Notification/ui/StartTimeNotification';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { response } = useChangeResponse();
  const { refuseResponse, acceptResponse } = useIsAcceptResponse();
  const { readStartTime } = useReadStartTime();

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col pl-[28px] pr-[27px] text-lg font-bold">
        <BackWardPageButton />
        <div className="mt-5 flex w-full justify-between">
          <span>알림</span>
          <Link to={'/reserve/notification/setting'}>
            <img width={27} height={27} src={setting} />
          </Link>
        </div>
      </div>
      <div className="mt-5 w-full">
        {readStartTime &&
          Object.keys(readStartTime.val()).map((key) => (
            <StartTimeNotification
              key={key}
              createdAt={readStartTime.val()[key].createdAt as Timestamp}
              seats={readStartTime.val()[key].seats as SeatType[]}
            />
          ))}
        {response &&
          Object.keys(response.val()).map((key) => (
            <NotificationRequest
              key={key}
              requestTitle="좌석 변경"
              requstTime={response.val()[key].createdAt as Timestamp}
              requsetContant={response.val()[key].mySeat as SeatType[]}
            />
          ))}
        {acceptResponse &&
          Object.keys(acceptResponse.val()).map((key) => (
            <AcceptResponse
              key={key}
              responseTitle={acceptResponse.val()[key].text as string}
              responseTime={acceptResponse.val()[key].createdAt as Timestamp}
              responseContant={
                acceptResponse.val()[key].targetSeats as SeatType[]
              }
              responseDeleteContant={
                acceptResponse.val()[key].mySeats as SeatType[]
              }
            />
          ))}
        {refuseResponse &&
          Object.keys(refuseResponse.val()).map((key) => (
            <RefuseResponse
              key={key}
              responseTitle={refuseResponse.val()[key].text as string}
              responseTime={refuseResponse.val()[key].createdAt as Timestamp}
              responseContant={
                refuseResponse.val()[key].targetSeats as SeatType[]
              }
              responseDeleteContant={
                refuseResponse.val()[key].mySeats as SeatType[]
              }
            />
          ))}
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
