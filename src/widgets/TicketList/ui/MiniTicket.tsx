import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatAM_PM, formatTimeView } from '@/shared/lib/formatDate';
import { useNavigation } from '../hooks/useNavigation';
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

const MiniTicket = () => {
  const { groupedArray } = useTicketLists() ?? {};
  const { navigate } = useNavigation();
  const { setStartDay, setSelectStartTime, setSelectTrainType, setSeatsId, setTrainNo } =
    trainDataStore();

  if (!groupedArray || groupedArray.length === 0) {
    return (
      <div className="flex h-[100px] w-full flex-col items-center justify-center rounded-lg bg-white shadow-sm">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  return (
    <>
      {groupedArray.map((groups, idx) => {
        const ticket = groups[0];
        const passengerCount = groups.length;

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

        return (
          <div key={idx} className="w-full overflow-hidden rounded-lg bg-white shadow-md">
            {/* 상단 */}
            <div className="flex flex-col gap-4 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="rounded bg-lightBlue px-2 py-0.5 text-xs font-semibold text-blue">
                  {trainTypeName}
                </span>
                <span className="text-xs text-gray-400">{ticket.startDayForView}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xl font-black text-black">{ticket.startStationForView}</span>
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
                onClick={() => {
                  navigate('/ticket/seatchange', { state: { groups } });
                  setStartDay(ticket.startDay);
                  setSelectStartTime(ticket.startTime);
                  setSelectTrainType(ticket.trainType);
                  setTrainNo(ticket.trainNoId);
                  setSeatsId(groups.map((item) => item.seatId));
                }}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-blue"
              >
                상세보기
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MiniTicket;
