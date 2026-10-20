/**
 * @role: features/hooks
 * @rule: 점유 좌석 교환 요청만 담당. 백엔드 POST /seats/change-requests 사용
 */
import { useLocation } from 'react-router-dom';
import { SeatType } from '@/entities/Seat/types/seatType';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { createChangeRequest } from '../api/ticketChangeApi';

export const useOccupiedSeats = () => {
  const location = useLocation();
  const { trainNo } = trainDataStore();
  const mySeats: SeatType[] = location.state;

  const occupiedSeatsChange = async (
    _groupSeats: SeatType[],
    seatsChangeTarget: SeatType[],
  ) => {
    const reservationIds = mySeats
      .map((s) => s.reservationId)
      .filter((id): id is number => id !== undefined);

    if (reservationIds.length === 0) return;

    const toSeatIds = seatsChangeTarget.map((s) => s.seatId);

    try {
      await createChangeRequest(reservationIds, Number(trainNo) || 1, toSeatIds);
    } catch (e) {
      console.log(e);
    }
  };

  return { occupiedSeatsChange };
};
