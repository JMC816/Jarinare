import useModalStore from '@/shared/modals/model/Notification';
import Modal from '@/widgets/modals/Notification/ui/Modal';
import NotificationRequest from '@/widgets/Notification/ui/NotificationRequest';

const NotificationPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex w-full flex-col items-center">
      <span className="w-full pl-[28px] pr-[27px] text-lg font-bold">알림</span>
      <div className="mt-5 w-full">
        <NotificationRequest
          requestTitle="좌석 변경"
          requstTime="30분전"
          requsetContant="A6 자리에서 변경 요청이 들어왔습니다."
        />
        <NotificationRequest
          requestTitle="좌석 변경"
          requstTime="1시간전"
          requsetContant="B8 자리에서 변경 요청이 들어왔습니다."
        />
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default NotificationPage;
