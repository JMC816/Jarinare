import useModalStore from '@/widgets/model/Notification';
import { NotificationRequestProps } from '../types/NotificationType';

const NotificationRequest = ({
  requestTitle,
  requstTime,
  requsetContant,
}: NotificationRequestProps) => {
  const { openModal } = useModalStore();
  return (
    <div className="flex h-[80px] flex-col bg-lightBlue p-[10px] active:bg-blue/20">
      <div className="flex justify-between text-tiny text-darkGray">
        <span>{requestTitle}</span>
        <span>{requstTime}</span>
      </div>
      <span className="text-tiny font-bold">{requsetContant}</span>
      <div>
        <span
          onClick={() => openModal('ResponseModal')}
          className="text-bold cursor-pointer text-left text-xs font-bold text-blue"
        >
          요청보기
        </span>
      </div>
    </div>
  );
};

export default NotificationRequest;
