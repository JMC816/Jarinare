import Ticket from '@/shared/ui/Ticket';
import arrow from '@/assets/icons/arrow.png';
import TicketButton from '@/shared/ui/TicketButton';
import { useNaviation } from '../hooks/TicketChangeHook';
import { useTicketLocation } from '../hooks/useTicketLocation';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useReset } from '../hooks/useReset';

const TicketSeatChangePage = () => {
  const { navigate } = useNaviation();
  const { location } = useTicketLocation();
  const seats: SeatType[] = location.state.groups;

  const filtred = seats.map((id) => id.seatId);

  useReset();

  return (
    <div className="flex w-full flex-col items-center pl-[38px] pr-[37px]">
      <div className="mt-[30px] w-full">
        <div className="flex justify-center text-lg font-bold">
          <span>{seats[0].startStationForView}</span>
          <img src={arrow} width={25} height={20} className="mx-[30px]" />
          <span>{seats[0].endStationForView}</span>
        </div>
        <div className="mt-[55px]">
          <Ticket
            seatIds={filtred}
            startTime={seats[0].startTime}
            endTime={seats[0].endTime}
            trainType={seats[0].trainType}
            trainNoId={seats[0].trainNoId}
            startDayForView={seats[0].startDayForView}
            selectKid={seats[0].selectKid}
            selectAdult={seats[0].selectAdult}
            selectPay={seats[0].selectPay}
          />
        </div>
        <div className="mt-[60px]">
          <TicketButton
            onClick={() => {
              navigate('/seatchange', {
                state: Array.isArray(seats) ? seats : [seats],
              });
            }}
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
