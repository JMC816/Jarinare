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
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px]">
      <BackWardPageButton title="좌석 상세" />

      {/* 티켓 카드 */}
      <div className="mt-8 w-full rounded-2xl bg-white px-5 py-5 shadow-sm">
        <div className="mb-5 flex w-full items-center justify-between text-lg font-bold text-gray-900">
          <span>{seats[0].startStationForView}</span>
          <div className="flex flex-1 items-center px-3">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <span className="mx-2 inline-block -scale-x-100 text-xl">🚄</span>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          </div>
          <span>{seats[0].endStationForView}</span>
        </div>
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

      {/* 좌석 변경 버튼 */}
      <div className="mt-4 w-full">
        <button
          onClick={() => {
            navigate('/seatchange', {
              state: Array.isArray(seats) ? seats : [seats],
            });
          }}
          className="w-full rounded-2xl bg-blue py-3.5 text-base font-bold text-white active:brightness-95"
        >
          좌석 변경
        </button>
      </div>
    </div>
  );
});

TicketSeatChangePage.displayName = 'TicketSeatChangePage';

export default TicketSeatChangePage;
