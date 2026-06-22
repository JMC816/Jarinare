/**
 * @role: widgets/TicketReserve — ui
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { useReserveTicket } from '../hooks/useReserveTicket';

const ReserveTicket = () => {
  const {
    isEmpty,
    ticket,
    trainTypeName,
    startLabel,
    endLabel,
    duration,
    passengerCount,
    handleDetail,
  } = useReserveTicket();

  if (isEmpty || !ticket) {
    return (
      <div className="mb-[20px] flex h-[138px] w-full shrink-0 flex-col items-center justify-center rounded-lg bg-white shadow-sm">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  return (
    <div className="mb-[20px] w-full shrink-0 overflow-hidden rounded-lg bg-white shadow-md">
      {/* 상단 */}
      <div className="flex flex-col gap-4 px-5 py-4">
        {/* 기차 배지 + 날짜 */}
        <div className="flex items-center justify-between">
          <span className="rounded bg-lightBlue px-2 py-0.5 text-xs font-semibold text-blue">
            {trainTypeName}
          </span>
          <span className="text-xs text-gray-400">
            {ticket.startDayForView}
          </span>
        </div>

        {/* 출발 - 아이콘 - 도착 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-black text-black">
              {ticket.startStationForView}
            </span>
            <span className="text-xs text-darkGray">{startLabel}</span>
          </div>

          <div className="flex flex-1 flex-col items-center gap-1 px-3">
            <div className="flex w-full items-center">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <span className="mx-2 inline-block -scale-x-100 text-xl">🚄</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>
            <span className="text-[10px] text-darkGray">{duration}</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-black text-black">
              {ticket.endStationForView}
            </span>
            <span className="text-xs text-darkGray">{endLabel}</span>
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between bg-gray-100 px-5 py-3">
        <span className="text-sm font-semibold text-darkGray">
          {passengerCount}명 · {trainTypeName}
        </span>
        <button
          onClick={handleDetail}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-blue"
        >
          상세보기
        </button>
      </div>
    </div>
  );
};

export default ReserveTicket;
