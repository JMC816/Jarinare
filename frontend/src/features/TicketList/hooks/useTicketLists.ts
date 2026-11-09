/**
 * @role: features/hooks
 * @rule: 내 예매 목록 가공만 담당. 만료된 티켓 삭제는 백엔드가 처리
 */
import { useState } from 'react';
import { SeatType } from '@/entities/Seat/types/seatType';
import {
  getCachedAllSeats,
  useAllSeatsInfo,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';

const parseEndTime = (endTime: number): Date => {
  const s = String(endTime);
  return new Date(
    Number(s.substring(0, 4)),
    Number(s.substring(4, 6)) - 1,
    Number(s.substring(6, 8)),
    Number(s.substring(8, 10)),
    Number(s.substring(10, 12)),
  );
};

export const useTicketLists = () => {
  const [seatsAllInfo, setSeatsAllInfo] = useState<SeatType[]>(getCachedAllSeats());
  useAllSeatsInfo((seats) => setSeatsAllInfo(seats));

  const filtered = seatsAllInfo.filter(
    (item) =>
      item.userId === 'me' && parseEndTime(item.endTime) > new Date(),
  );

  const groupSeats = filtered.reduce<Record<number, SeatType[]>>(
    (acc, current) => {
      acc[current.createAt] = acc[current.createAt] || [];
      acc[current.createAt].push(current);
      return acc;
    },
    {},
  );
  const groupedArray = Object.values(groupSeats);
  return { groupedArray };
};
