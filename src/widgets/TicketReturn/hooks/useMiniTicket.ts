/**
 * @role: widgets/TicketReturn — hooks
 * @rule: MiniTicket 파생 데이터·핸들러만 담당, UI 포함 금지
 */
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatTimeView } from '@/shared/lib/formatDate';
import { useNavigate } from 'react-router-dom';

const calcDuration = (start: number, end: number) => {
  const sh = parseInt(String(start).substring(8, 10));
  const sm = parseInt(String(start).substring(10, 12));
  const eh = parseInt(String(end).substring(8, 10));
  const em = parseInt(String(end).substring(10, 12));
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  if (diff >= 60)
    return `${Math.floor(diff / 60)}시간 ${diff % 60 > 0 ? `${diff % 60}분` : ''}`;
  return `${diff}분`;
};

export const useMiniTicket = () => {
  const { groupedArray } = useTicketLists() ?? {};
  const navigate = useNavigate();

  const tickets = (groupedArray ?? []).map((groups) => {
    const ticket = groups[0];

    const trainTypeName = (() => {
      const parts = ticket.trainType.split('-');
      const first = parts[0];
      const namePart = parts[1]?.split('(')[0] ?? '';
      return namePart ? `${first} ${namePart}` : first;
    })();

    return {
      ticket,
      groups,
      trainTypeName,
      startLabel: formatTimeView(String(ticket.startTime)),
      endLabel: formatTimeView(String(ticket.endTime)),
      duration: calcDuration(ticket.startTime, ticket.endTime),
      handleReturn: () => navigate('/return', { state: { groups } }),
    };
  });

  return { tickets };
};
