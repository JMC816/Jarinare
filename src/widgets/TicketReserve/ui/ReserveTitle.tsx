import notification from '@/assets/icons/notification.png';
import { Link } from 'react-router-dom';
import { ReserveTitleProp } from '../types/ReserveType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';
import { useIsNotificationResponse } from '@/features/Notification/hooks/useIsNotificationResponse';
import { useReadStartTime } from '@/features/Notification/hooks/useReadStartTime';

const ReserveTitle = ({ text }: ReserveTitleProp) => {
  const { response } = useChangeResponse();
  const { acceptResponse, refuseResponse } = useIsAcceptResponse();
  const { isNotification } = useIsNotificationResponse();
  const { readStartTime } = useReadStartTime();

  // 출발 알림 개수
  const isReadStartTime =
    readStartTime && Object.entries(readStartTime?.val()).length;

  // 거절 알림 개수
  const isRefuseResponse =
    refuseResponse && Object.entries(refuseResponse?.val()).length;

  // 수락 알림 개수
  const isAcceptResponse =
    acceptResponse && Object.entries(acceptResponse?.val()).length;

  // 좌석 변경 요청 알림 개수
  const isChangeResponse = response && Object.entries(response?.val()).length;

  // 수락 또는 거절이 하나라도 있으면서 알림이 활성화 되어 있으면 true
  const isChangeRefuseOrAcceptResponse = ((isRefuseResponse! > 0 ||
    isAcceptResponse! > 0) &&
    isNotification?.data()!.response) as boolean;

  // 변경 요청 알림이 하나라도 있으면서 알림이 활성화 되어 있으면 true
  const isSeatsChangeResponse = (isChangeResponse! > 0 &&
    isNotification?.data()!.change) as boolean;

  return (
    <div className="mb-[25px] mt-[60px] flex w-full items-center justify-between">
      <span className="text-lg font-bold">{text}</span>
      {text == '어디로 갈까요?' ? (
        <Link to={'/reserve/notification'} className="relative">
          <img width={19} height={24} src={notification} />
          {isChangeRefuseOrAcceptResponse ||
          isSeatsChangeResponse ||
          (isChangeRefuseOrAcceptResponse && isSeatsChangeResponse) ||
          isReadStartTime ? (
            <span className="absolute bottom-6 left-4 size-1.5 animate-ping rounded-full bg-blue" />
          ) : null}
        </Link>
      ) : (
        <Link className="text-sm font-bold text-blue" to={'/ticketList'}>
          더보기
        </Link>
      )}
    </div>
  );
};

export default ReserveTitle;
