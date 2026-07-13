/**
 * @role: features — 승차권 반환 처리
 * @rule: 상태·사이드이펙트·이벤트 핸들러만 담당
 */
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { useCreateOrder } from '@/features/Point/hooks/useCreateOrder';
import { db } from '@/shared/firebase/firebase';
import { deleteDoc, doc } from 'firebase/firestore';

export const useTicketReturn = () => {
  const { seatsReturnData } = seatsReturnDataStore();
  const { createOrder } = useCreateOrder();

  // 선택한 승차권 제거
  const handleDeleteSeats = async () => {
    try {
      await Promise.all(
        seatsReturnData.map((item) =>
          deleteDoc(
            doc(
              db,
              'train',
              item.id,
              'no',
              item.trainNoId,
              'seats',
              item.seatId,
            ),
          ),
        ),
      );

      // 반환 내역 기록
      if (seatsReturnData.length > 0) {
        const first = seatsReturnData[0];
        await createOrder({
          startStationForView: first.startStationForView,
          endStationForView: first.endStationForView,
          startDay: first.startDay,
          startDayForView: first.startDayForView,
          trainType: first.trainType,
          selectAdult: first.selectAdult,
          selectKid: first.selectKid,
          seatCount: seatsReturnData.length,
          finalPrice: first.selectPay,
          paymentMethod: '반환',
          selectedCard: null,
          isReturn: true,
        });
      }

      clearAllSeatsCache();
      prefetchAllSeats();
    } catch (e) {
      console.log(e);
    }
  };
  return { handleDeleteSeats };
};
