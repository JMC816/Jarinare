import notification from '@/assets/icons/notification.png';
import { ReserveTitleProp } from '../types/ReserveTitle';
import { Link } from 'react-router-dom';

const ReserveTitle = ({ text }: ReserveTitleProp) => {
  return (
    <div className="mb-[25px] mt-[60px] flex w-full items-center justify-between">
      <span className="text-lg font-bold">{text}</span>
      {text == '어디로 갈까요?' ? (
        <Link to={'/reserve/notification'}>
          <img width={19} height={24} src={notification} />
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
