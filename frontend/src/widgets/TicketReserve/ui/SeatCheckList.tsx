import loading from '@/assets/icons/loading.png';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { reserveConstants } from '../constants/ReserveConstants';
import { seatsStateStore } from '@/features/TicketReserve/model/seatsStateStore';
import { useResetSeatsState } from '@/features/TicketReserve/hooks/useResetSeatsState';

const SeatCheckList = () => {
  const { handleSingleSelect, seatsInfo, locks, isLocksLoaded } = useSeatQueryData();
  const { seatsState } = seatsStateStore();
  const { seatsRows } = reserveConstants();

  useResetSeatsState();

  if (!seatsState)
    return (
      <div className="mt-[15px] flex h-[420px] items-center justify-center">
        <img src={loading} className="h-12 w-12 animate-spin" />
      </div>
    );

  const getSeatBg = (id: string) => {
    const isMine = seatsInfo.some((item) => item.seatId === id && item.userId === 'me');
    const isOther = seatsInfo.some((item) => item.seatId === id && item.userId === 'other');
    const isLocked = id in locks;
    if (isMine || seatsState[id]) return 'blue';
    if (isOther || isLocked) return 'lightGray';
    return 'lightesGray';
  };

  return (
    <div className="mt-2 flex flex-col items-center">
      {/* 열 헤더 */}
      <div className="mb-2 flex w-fit gap-6">
        <div className="flex gap-2">
          {['A', 'B'].map((col) => (
            <span key={col} className="flex h-[44px] w-[44px] items-center justify-center text-sm text-gray-400">
              {col}
            </span>
          ))}
        </div>
        <div className="w-9" />
        <div className="flex gap-2">
          {['C', 'D'].map((col) => (
            <span key={col} className="flex h-[44px] w-[44px] items-center justify-center text-sm text-gray-400">
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* 좌석 행 */}
      {seatsRows.map((row) => {
        const leftSeats = [`A${row}`, `B${row}`];
        const rightSeats = [`C${row}`, `D${row}`];

        return (
          <div key={row} className="mb-2 flex w-fit items-center gap-6">
            <div className="flex gap-2">
              {leftSeats.map((id) => {
                const bg = getSeatBg(id);
                return (
                  <div
                    key={id}
                    onClick={isLocksLoaded ? () => handleSingleSelect(id) : undefined}
                    className={`bg-${bg} flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-md border border-gray-200`}
                  >
                    <span className={`text-xs ${bg === 'blue' ? 'text-white' : 'text-gray-400'}`}>{id}</span>
                  </div>
                );
              })}
            </div>
            <span className="flex w-9 items-center justify-center text-sm text-gray-400">{row}</span>
            <div className="flex gap-2">
              {rightSeats.map((id) => {
                const bg = getSeatBg(id);
                return (
                  <div
                    key={id}
                    onClick={isLocksLoaded ? () => handleSingleSelect(id) : undefined}
                    className={`bg-${bg} flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-md border border-gray-200`}
                  >
                    <span className={`text-xs ${bg === 'blue' ? 'text-white' : 'text-gray-400'}`}>{id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeatCheckList;
