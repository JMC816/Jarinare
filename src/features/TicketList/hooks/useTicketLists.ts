import { SeatType } from '@/entities/Seat/types/seatType';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { auth } from '@/shared/firebase/firebase';

export const useTicketLists = () => {
  const { seatsAllInfo } = useSeatQueryData();
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  const filtered = seatsAllInfo.filter((item) => item.userId === user.uid);

  // 생성 시간을 key로 하여 2개 이상의 좌석을 선택했을 경우 하나의 배열로 반환
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
