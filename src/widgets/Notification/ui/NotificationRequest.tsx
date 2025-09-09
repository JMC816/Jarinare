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

  const elapsedTime = () => {
    const requestTime = new Date(requstTime ? Number(requstTime) : 0);
    const nowTime = new Date();

    const diff = (nowTime.getTime() - requestTime.getTime()) / 1000;

    const times = [
      { name: '년', milliSeconds: 60 * 60 * 24 * 365 },
      { name: '개월', milliSeconds: 60 * 60 * 24 * 30 },
      { name: '일', milliSeconds: 60 * 60 * 24 },
      { name: '시간', milliSeconds: 60 * 60 },
      { name: '분', milliSeconds: 60 },
    ];

    for (const value of times) {
      const betweenTime = Math.floor(diff / value.milliSeconds);

      if (betweenTime > 0) {
        return `${betweenTime}${value.name} 전`;
      }
    }
    return '방금 전';
  };

  return (
    <div className="flex h-[80px] flex-col bg-lightBlue p-[10px] active:bg-blue/20">
      <div className="flex justify-between text-tiny text-darkGray">
        <span>{requestTitle}</span>
        <span>{elapsedTime()}</span>
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
