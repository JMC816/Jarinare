import { seatsChangeMixTargetSeatIdStore } from '@/features/TicketChange/models/seatsChangeMixTargetSeatIdStore';
import { seatsChangeTargetStore } from '@/features/TicketChange/models/seatsChangeTargetStore';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { shareKeepSeatsStore } from '@/features/TicketChange/models/shareKeepSeatsStore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { get, ref, set } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useExistMixChangeRequestBlocked = () => {
  const { seatsState } = seatsStateStore();
  const { seatsChangeMixTargetSeatId } = seatsChangeMixTargetSeatIdStore();
  const { shareKeepSeats } = shareKeepSeatsStore();
  const [isExistMixRequestBlocked, setIsExistMixRequestBlocked] =
    useState<boolean>(false);

  const { seatsChangeTarget } = seatsChangeTargetStore();

  const user = auth.currentUser;

  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  useEffect(() => {
    const seatsChangeBlocked = async () => {
      if (!user) return;

      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      // 데이터가 존재하지 않으면 좌석 변경 가능
      if (!data || data === null) {
        return setIsExistMixRequestBlocked(false);
      }

      const filteredKeys = Object.keys(data).filter((key) => key !== 'locks');

      // 좌석 변경 요청 데이터의 키(userId)
      for (const key of filteredKeys) {
        // 요청을 받은, 즉 상대방의 모든 요청 데이터
        const allDbRef = await get(ref(realtimeDb, key));

        if (allDbRef.exists()) {
          const values = allDbRef.val();

          // 변경 요청을 받은 좌석 데이터들
          const mixSeatId = (
            Object.entries(values)[0][1] as {
              mixTarget: {
                seatsChangeMixTargetSeatId: string[];
              };
            }
          ).mixTarget?.seatsChangeMixTargetSeatId;

          const mixId = (
            Object.entries(values)[0][1] as {
              mixTarget: {
                id: string;
              };
            }
          ).mixTarget?.id;

          const mixTrainNoId = (
            Object.entries(values)[0][1] as {
              mixTarget: {
                trainNoId: string;
              };
            }
          ).mixTarget?.trainNoId;

          mixSeatId.map(async (item) => {
            const seatLockRef = ref(
              realtimeDb,
              `locks/${mixId}/${mixTrainNoId}/${item}`,
            );
            await set(seatLockRef, {
              mixSeatId,
            });
          });

          // 변경 요청 데이터에 빈좌석 + 상대방 좌석가 존재하고 내가 선택한 좌석이 빈좌석 + 상대방 좌석이라면 변경 요청 불가
          // 빈 좌석은 변동이 있어도 상대방 좌석은 고정적이므로 변경 요청 데이터에는 포함되기 때문에 변경 요청 불가
          const result =
            mixId === seatsChangeTarget[0]?.id &&
            mixTrainNoId === seatsChangeTarget[0]?.trainNoId &&
            mixSeatId?.some((item) =>
              seatsChangeMixTargetSeatId.includes(item),
            );

          setIsExistMixRequestBlocked(result);
        }
      }
    };
    seatsChangeBlocked();
  }, [
    seatsState,
    emptySeatsTarget,
    shareKeepSeats,
    seatsChangeMixTargetSeatId,
  ]);

  return { isExistMixRequestBlocked };
};
