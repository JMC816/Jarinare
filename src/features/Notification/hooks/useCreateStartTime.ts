import { SeatType } from '@/entities/Seat/types/seatType';
import { realtimeDb } from '@/shared/firebase/firebase';
import { ref, serverTimestamp, set } from 'firebase/database';

export const useCreateStartTime = () => {
  // 출발 알림 생성
  const creatStartTime = async (timeDifferenceData: SeatType[][]) => {
    if (timeDifferenceData[0].length === 0) return;

    for (const item of timeDifferenceData) {
      await set(
        ref(
          realtimeDb,
          `${item[0].userId}_startTime/${item[0].id}_${item[0].trainNoId}_${item.map((id) => id.seatId)}`,
        ),
        {
          createdAt: serverTimestamp(),
          seats: item,
          isRead: false,
        },
      );
    }
  };
  return { creatStartTime };
};
