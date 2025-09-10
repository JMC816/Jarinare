import notification from '@/assets/icons/notification.png';
import { Link } from 'react-router-dom';
import { ReserveTitleProp } from '../types/ReserveType';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useIsAcceptResponse } from '@/features/Notification/hooks/useIsAcceptResponse';

const ReserveTitle = ({ text }: ReserveTitleProp) => {
  const { response } = useChangeResponse();
  const { acceptResponse, refuseResponse } = useIsAcceptResponse();

  const isResponse =
    (refuseResponse && Object.entries(refuseResponse?.val()).length) ||
    (acceptResponse && Object.entries(acceptResponse?.val()).length) ||
    (response && Object.entries(response?.val()).length);

  return (
    <div className="mb-[25px] mt-[60px] flex w-full items-center justify-between">
      <span className="text-lg font-bold">{text}</span>
      {text == '어디로 갈까요?' ? (
        <Link to={'/reserve/notification'} className="relative">
          <img width={19} height={24} src={notification} />
          {isResponse && isResponse > 0 ? (
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
