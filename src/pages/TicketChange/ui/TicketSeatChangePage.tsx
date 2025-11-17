import Ticket from '@/shared/ui/Ticket';
import arrow from '@/assets/icons/arrow.png';
import TicketButton from '@/shared/ui/TicketButton';
import { useNaviation } from '../hooks/TicketChangeHook';
import { useTicketLocation } from '../hooks/useTicketLocation';
import { SeatType } from '@/entities/Seat/types/seatType';
import { useReset } from '../hooks/useReset';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { memo, useMemo } from 'react';

const TicketSeatChangePage = memo(() => {
  const { navigate } = useNaviation();
  const { location } = useTicketLocation();
  const seats: SeatType[] = location.state.groups;

  // useMeme로 불필요한 재계산 방지
  const filtred = useMemo(() => {
    return seats?.map((id) => id.seatId);
  }, [seats]);

  useReset();

  if (!seats) return;

  return (
    <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
      <BackWardPageButton />
      <div className="mt-[30px] w-full pl-[10px] pr-[10px]">
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
});

TicketSeatChangePage.displayName = 'TicketSeatChangePage';

export default TicketSeatChangePage;
