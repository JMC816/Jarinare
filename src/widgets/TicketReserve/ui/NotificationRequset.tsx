import { NotificationRequestProps } from '../types/NotificationRequest';

const NotificationRequest = ({
  requestTitle,
  requstTime,
  requsetContant,
}: NotificationRequestProps) => {
  return (
    <div className="flex h-[80px] flex-col bg-lightBlue p-[10px] active:bg-blue/20">
      <div className="flex justify-between text-tiny text-darkGray">
        <span>{requestTitle}</span>
        <span>{requstTime}</span>
      </div>
      <span className="text-tiny font-bold">{requsetContant}</span>
      <span className="text-bold text-xs font-bold text-blue">요청보기</span>
    </div>
  );
};

export default NotificationRequest;
