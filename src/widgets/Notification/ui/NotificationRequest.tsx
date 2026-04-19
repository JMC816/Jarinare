import useModalStore from '@/widgets/model/Notification';
import { NotificationRequestProps } from '../types/NotificationType';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { responesBySeatIdTrainNoIdStore } from '@/features/Notification/models/responseBySeatIdAndTrainNoIdStore';
import { elapsedTime } from '@/shared/lib/formatDate';

const NotificationRequest = ({
  requestTitle,
  requstTime,
  requsetContant,
  isRead,
  onClick,
}: NotificationRequestProps) => {
  const { openModal } = useModalStore();
  const { setSeatIds } = responesBySeatIdStore();
  const { setSeatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();

  return (
    <div
      onClick={onClick}
      className={`mx-4 my-2 rounded-2xl px-4 py-3 shadow-sm ${isRead ? 'bg-gray-100' : 'bg-white'}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded-full bg-blue/10 px-2 py-0.5 text-xs font-bold text-blue">
          {requestTitle}
        </span>
        <span className="text-xs text-darkGray">
          {elapsedTime(Number(requstTime))}
        </span>
      </div>
      <p className="text-tiny font-bold text-gray-800">
        {requsetContant.map((item) => item.seatId).join(' • ')} 자리에서 변경
        요청이 들어왔습니다.
      </p>
      <span
        onClick={(e) => {
          e.stopPropagation();
          openModal('ResponseModal');
          setSeatIds(requsetContant.map((item) => item.seatId));
          setSeatIdsAndTrainNoId(requsetContant);
        }}
        className="mt-1 inline-block cursor-pointer text-xs font-bold text-blue underline"
      >
        요청보기
      </span>
    </div>
  );
};

export default NotificationRequest;
