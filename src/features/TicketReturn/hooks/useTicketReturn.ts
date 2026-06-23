import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { db } from '@/shared/firebase/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const useTicketReturn = () => {
  const { seatsReturnData } = seatsReturnDataStore();
  const navigate = useNavigate();

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
      clearAllSeatsCache();
      prefetchAllSeats();
      navigate(-1);
    } catch (e) {
      console.log(e);
    }
  };
  return { handleDeleteSeats };
};
