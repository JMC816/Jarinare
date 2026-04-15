import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatAM_PM, formatTimeView } from '@/shared/lib/formatDate';
import { useNavigation } from '../hooks/ReserveHook';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const calcDuration = (start: number, end: number) => {
  const sh = parseInt(String(start).substring(8, 10));
  const sm = parseInt(String(start).substring(10, 12));
  const eh = parseInt(String(end).substring(8, 10));
  const em = parseInt(String(end).substring(10, 12));
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff >= 60) return `${Math.floor(diff / 60)}시간 ${diff % 60}분`;
  return `${diff}분`;
};

const ReserveTicket = () => {
  const ticketData = useTicketLists();
  const { navigate } = useNavigation();
  const { setStartDay, setSelectStartTime, setSelectTrainType, setSeatsId, setTrainNo } =
    trainDataStore();

  if (!ticketData || !ticketData.groupedArray || ticketData.groupedArray.length === 0) {
    return (
      <div className="mb-[20px] flex h-[138px] w-full shrink-0 flex-col items-center justify-center rounded-lg bg-white shadow-sm">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  const { groupedArray } = ticketData;
  const ticket = groupedArray[0][0];
  const passengerCount = groupedArray[0].length;

  const trainTypeName = (() => {
    const parts = ticket.trainType.split('-');
    const first = parts[0];
    const namePart = parts[1]?.split('(')[0] ?? '';
    return namePart ? `${first} ${namePart}` : first;
  })();

  const startLabel =
    formatAM_PM(String(ticket.startTime)) < 12
      ? `오전 ${formatTimeView(String(ticket.startTime))}`
      : `오후 ${formatTimeView(String(ticket.startTime))}`;

  const endLabel =
    formatAM_PM(String(ticket.endTime)) < 12
      ? `오전 ${formatTimeView(String(ticket.endTime))}`
      : `오후 ${formatTimeView(String(ticket.endTime))}`;

  const duration = calcDuration(ticket.startTime, ticket.endTime);

  const handleDetail = () => {
    navigate('/ticket/seatchange', { state: { groups: groupedArray[0] } });
    setStartDay(ticket.startDay);
    setSelectStartTime(ticket.startTime);
    setSelectTrainType(ticket.trainType);
    setTrainNo(ticket.trainNoId);
    setSeatsId(groupedArray[0].map((item) => item.seatId));
  };

  return (
    <div className="mb-[20px] w-full shrink-0 overflow-hidden rounded-lg bg-white shadow-md">
      {/* 상단 */}
      <div className="flex flex-col gap-4 px-5 py-4">
        {/* 기차 배지(왼쪽) + 날짜(오른쪽) */}
        <div className="flex items-center justify-between">
          <span className="rounded bg-lightBlue px-2 py-0.5 text-xs font-semibold text-blue">
            {trainTypeName}
          </span>
          <span className="text-xs text-gray-400">{ticket.startDayForView}</span>
        </div>

        {/* 출발 - 기차아이콘 - 도착 */}
        <div className="flex items-center justify-between">
          {/* 출발역 */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-black text-black">{ticket.startStationForView}</span>
            <span className="text-xs text-darkGray">{startLabel}</span>
          </div>

          {/* 점선 + 아이콘 */}
          <div className="flex flex-1 flex-col items-center gap-1 px-3">
            <div className="flex w-full items-center">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <span className="mx-2 inline-block -scale-x-100 text-xl">🚄</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>
            <span className="text-[10px] text-darkGray">{duration}</span>
          </div>

          {/* 도착역 */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-black text-black">{ticket.endStationForView}</span>
            <span className="text-xs text-darkGray">{endLabel}</span>
          </div>
        </div>
      </div>

      {/* 하단 회색 */}
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
