/**
 * @role: features/hooks
 * @rule: 빈 좌석으로 즉시 이동 로직만 담당. 백엔드 POST /seats/change-requests 사용
 */
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { createChangeRequest } from '../api/ticketChangeApi';

export const useEmptySeats = () => {
  const location = useLocation();
  const { trainNo } = trainDataStore();
  const mySeats: SeatType[] = location.state;

  const emptySeatsChange = async (emptySeatsTarget: string[]) => {
    if (emptySeatsTarget.length !== mySeats.length) return;

    const reservationIds = mySeats
      .map((s) => s.reservationId)
      .filter((id): id is number => id !== undefined);

    if (reservationIds.length === 0) return;

    try {
      await createChangeRequest(reservationIds, Number(trainNo) || 1, emptySeatsTarget);
    } catch (e) {
      console.log(e);
    }
  };

  return { emptySeatsChange };
};
