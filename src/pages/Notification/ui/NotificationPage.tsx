import { SeatType } from '@/entities/Seat/types/seatType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import useModalStore from '@/widgets/model/Notification';
import Modal from '@/widgets/Notification/ui/Modal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  const { response } = useChangeResponse();

  if (!response) {
    return;
  }

  const keys = Object.keys(response.val());

  return (
    <div className="flex w-full flex-col items-center">
      <span className="w-full pl-[28px] pr-[27px] text-lg font-bold">알림</span>
      <div className="mt-5 w-full">
        {keys.map((key) => (
          <NotificationRequest
            key={key}
            requestTitle="좌석 변경"
            requstTime="30분전"
            requsetContant={response.val()[key].mySeat as SeatType[]}
          />
        ))}
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
