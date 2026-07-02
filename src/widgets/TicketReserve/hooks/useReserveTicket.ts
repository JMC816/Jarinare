/**
 * @role: widgets/TicketReserve — hooks
 * @rule: ReserveTicket 렌더링에 필요한 파생 데이터 계산만 담당, UI 포함 금지
 */
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatAM_PM, formatTimeView } from '@/shared/lib/formatDate';
import { useNavigation } from './ReserveHook';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

const calcDuration = (start: number, end: number) => {
  const sh = parseInt(String(start).substring(8, 10));
  const sm = parseInt(String(start).substring(10, 12));
  const eh = parseInt(String(end).substring(8, 10));
  const em = parseInt(String(end).substring(10, 12));
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return diff >= 60
    ? `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ''}`
    : `${diff}분`;
};

export const useReserveTicket = () => {
  const ticketData = useTicketLists();
  const { navigate } = useNavigation();

  if (!ticketData?.groupedArray || ticketData.groupedArray.length === 0) {
    return { isEmpty: true };
  }

  const groups = ticketData.groupedArray[0];
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

  const startTimeStr = String(ticket.startTime);
  const dotDate = `${startTimeStr.slice(0, 4)}.${startTimeStr.slice(4, 6)}.${startTimeStr.slice(6, 8)}`;
  const dateObj = new Date(
    Number(startTimeStr.slice(0, 4)),
    Number(startTimeStr.slice(4, 6)) - 1,
    Number(startTimeStr.slice(6, 8)),
  );
  const koreanDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일(${WEEK_DAYS[dateObj.getDay()]})`;

  const seatIds = groups.map((g) => g.seatId).join(', ');

  const handleDetail = () => {
    navigate('/ticketlist');
  };

  return {
    isEmpty: false,
    ticket,
    trainTypeName,
    startLabel,
    endLabel,
    duration,
    dotDate,
    koreanDate,
    seatIds,
    passengerCount,
    handleDetail,
  };
};
