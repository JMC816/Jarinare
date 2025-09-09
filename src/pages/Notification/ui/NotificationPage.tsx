import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import useModalStore from '@/widgets/model/Notification';
import Modal from '@/widgets/Notification/ui/Modal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';
import { Timestamp } from 'firebase/firestore';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { response } = useChangeResponse();

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col pl-[28px] pr-[27px] text-lg font-bold">
        <BackWardPageButton />
        <span className="mt-5">알림</span>
      </div>
      <div className="mt-5 w-full">
        {response &&
          Object.keys(response.val()).map((key) => (
            <NotificationRequest
              key={key}
              requestTitle="좌석 변경"
              requstTime={response.val()[key].createdAt as Timestamp}
              requsetContant={response.val()[key].mySeat as SeatType[]}
            />
          ))}
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
