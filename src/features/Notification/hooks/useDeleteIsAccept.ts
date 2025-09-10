import { SeatType } from '@/entities/Seat/types/seatType';
import { realtimeDb } from '@/shared/firebase/firebase';
import { ref, remove } from 'firebase/database';

export const useDeleteIsAccept = () => {
  // 거절 알림 삭제
  const deleteRefuse = async (responseDeleteContent: SeatType[]) => {
    const requestRef = ref(
      realtimeDb,
      `${responseDeleteContent[0]?.userId}_refuse/${responseDeleteContent[0]?.id}_${responseDeleteContent[0]?.trainNoId}_${responseDeleteContent?.map((item) => item.seatId)}`,
    );
    await remove(requestRef);
  };

  // 수락 알림 삭제
  const deleteAccept = async (responseDeleteContent: SeatType[]) => {
    const requestRef = ref(
      realtimeDb,
      `${responseDeleteContent[0]?.userId}_accept/${responseDeleteContent[0]?.id}_${responseDeleteContent[0]?.trainNoId}_${responseDeleteContent?.map((item) => item.seatId)}`,
    );
    await remove(requestRef);
  };

  return { deleteAccept, deleteRefuse };
};
