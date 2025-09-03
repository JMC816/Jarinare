import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { get, ref, set } from 'firebase/database';
import { useEffect } from 'react';

export const useExistChangeRequestBlocked = () => {
  const { seatsChangeTarget } = seatsChangeTargetStore();

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const seatsChangeBlocked = async () => {
      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      const filteredKeys = Object.keys(data).filter((key) => key !== 'locks');

      for (const key of filteredKeys) {
        const allDbRef = await get(ref(realtimeDb, key));
        if (allDbRef.exists()) {
          const values = allDbRef.val();

          const mySeats = (
            Object.entries(values)[0][1] as {
              mySeat: SeatType[];
            }
          ).mySeat;

          mySeats.map(async (item) => {
            const seatLockRef = ref(
              realtimeDb,
              `locks/${mySeats[0].id}/${mySeats[0].trainNoId}/${item.seatId}`,
            );
            await set(seatLockRef, {
              mySeats,
            });
          });

          // 좌석 변경 요청을 보낸 좌석은 상대방들에겐 변경 요청 가능한 좌석이므로 변경 요청 데이터가 있을 시 좌석 선택 불가
        }
      }
    };
    seatsChangeBlocked();
  }, [seatsChangeTarget]);
};
