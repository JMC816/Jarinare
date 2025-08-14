import useModalStore from '@/widgets/model/Notification';
import { NotificationRequestProps } from '../types/NotificationType';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { responesBySeatIdTrainNoIdStore } from '@/features/Notification/models/responseBySeatIdAndTrainNoIdStore';

const NotificationRequest = ({
  requestTitle,
  requstTime,
  requsetContant,
}: NotificationRequestProps) => {
  const { openModal } = useModalStore();
  const { setSeatIds } = responesBySeatIdStore();
  const { setSeatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();

  return (
    <div className="flex h-[80px] flex-col bg-lightBlue p-[10px] active:bg-blue/20">
      <div className="flex justify-between text-tiny text-darkGray">
        <span>{requestTitle}</span>
        <span>{requstTime}</span>
      </div>
      <span className="text-tiny font-bold">
        {requsetContant.map((item) => item.seatId).join(' • ')} 자리에서 변경
        요청이 들어왔습니다.
      </span>
      <div>
        <span
          onClick={() => {
            openModal('ResponseModal');
            setSeatIds(requsetContant.map((item) => item.seatId));
            setSeatIdsAndTrainNoId(requsetContant);
          }}
          className="text-bold cursor-pointer text-left text-xs font-bold text-blue"
        >
          요청보기
        </span>
      </div>
    </div>
  );
};

export default NotificationRequest;
