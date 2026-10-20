/**
 * @role: features — 승차권 반환 처리
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { cancelReservation } from '@/features/TicketReserve/api/reservationApi';

export const useTicketReturn = () => {
  const { seatsReturnData } = seatsReturnDataStore();

  const handleDeleteSeats = async () => {
    try {
      const reservationIds = seatsReturnData
        .map((item) => item.reservationId)
        .filter((id): id is number => id !== undefined);

      if (reservationIds.length > 0) {
        await cancelReservation(reservationIds);
      }

      clearAllSeatsCache();
      prefetchAllSeats();
    } catch (e) {
      console.log(e);
    }
  };

  return { handleDeleteSeats };
};
