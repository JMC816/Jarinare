import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useExistChangeRequestBlocked = () => {
  const { seatsChangeTarget } = seatsChangeTargetStore();
  const [isExistRequestBlocked, setIsExistRequestBlocked] =
    useState<boolean>(false);

  const user = auth.currentUser;

  useEffect(() => {
    const seatsChangeBlocked = async () => {
      if (!user) return;

      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      // 데이터가 존재하지 않으면 좌석 변경 가능
      if (!data || data === null) {
        return setIsExistRequestBlocked(false);
      }

      for (const key of Object.keys(data)) {
        const allDbRef = await get(ref(realtimeDb, key));

        if (allDbRef.exists()) {
          const values = allDbRef.val();
          const value = Object.keys(values);

          if (seatsChangeTarget.length === 0) {
            return setIsExistRequestBlocked(false);
          }

          // 좌석 변경 요청을 보낸 좌석은 상대방들에겐 변경 요청 가능한 좌석이므로 변경 요청 데이터가 있을 시 좌석 선택 불가
          setIsExistRequestBlocked(
            value.includes(
              `${seatsChangeTarget[0]?.id}_${seatsChangeTarget[0]?.trainNoId}_${seatsChangeTarget.map((item) => item.seatId)}`,
            ),
          );
        }
      }
    };
    seatsChangeBlocked();
  }, [seatsChangeTarget]);
  return { isExistRequestBlocked };
};
