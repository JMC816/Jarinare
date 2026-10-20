/**
 * @role: features/hooks
 * @rule: 좌석 변경 요청만 담당. 백엔드 POST /seats/change-requests 사용
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsChangeInfoStore } from '@/features/TicketChange/models/seatsChangeInfoStore';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { useLocation } from 'react-router-dom';
import { createChangeRequest } from '@/features/TicketChange/api/ticketChangeApi';
import { isAxiosError } from 'axios';

export const useChangeRequest = () => {
  const location = useLocation();
  const { seatsChangeInfo } = seatsChangeInfoStore();
  const { seatsState } = seatsStateStore();
  const { trainNo } = trainDataStore();

  const mySeats: SeatType[] = location.state;

  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  const changeRequset = async (target: string[]) => {
    const reservationIds = mySeats
      .map((s) => s.reservationId)
      .filter((id): id is number => id !== undefined);

    if (reservationIds.length === 0) return;

    const carNo = Number(trainNo) || 1;

    // 점유 좌석이 포함된 경우: 해당 좌석들을 포함해서 변경 요청
    const hasOccupied = seatsChangeInfo.some((item) =>
      target.includes(item.seatId),
    );
    const toSeatIds = hasOccupied ? target : emptySeatsTarget;

    try {
      await createChangeRequest(reservationIds, carNo, toSeatIds);
      return null;
    } catch (e) {
      if (
        isAxiosError(e) &&
        (e.response?.status === 400 || e.response?.status === 409)
      ) {
        return (e.response.data?.message as string) ?? '요청에 실패했습니다.';
      }
      return null;
    }
  };

  return { changeRequset };
};
