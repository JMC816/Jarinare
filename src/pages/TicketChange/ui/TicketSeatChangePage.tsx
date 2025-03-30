import Ticket from '@/shared/ui/Ticket';
import arrow from '@/assets/icons/arrow.png';
import TicketButton from '@/shared/ui/TicketButton';
import { navigate } from '../hooks/TicketChange';

const TicketSeatChangePage = () => {
  const { moveSeatChangePage } = navigate();
  return (
    <div className="flex w-full flex-col items-center pl-[38px] pr-[37px]">
      <div className="mt-[30px] w-full">
        <div className="flex justify-center text-lg font-bold">
          <span>서울</span>
          <img src={arrow} width={25} height={20} className="mx-[30px]" />
          <span>대전</span>
        </div>
        <div className="mt-[55px]">
          <Ticket />
        </div>
        <div className="mt-[60px]">
          <TicketButton
            onClick={() => moveSeatChangePage('/seatchange')}
            text="좌석 변경"
            bgColor="blue"
            textColor="white"
          />
        </div>
      </div>
    </div>
  );
};

export default TicketSeatChangePage;
