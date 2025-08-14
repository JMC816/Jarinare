import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export const useSeatsChangeBlocked = () => {
  const { seatsTarget } = seatsTargetStore();
  const { groupSeats } = groupSeatsStore();
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const user = auth.currentUser;

  useEffect(() => {
    const seatsChangeBlocked = async () => {
      if (!user) return;

      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      // 데이터가 존재하지 않으면 좌석 변경 가능
      if (!data || data === undefined) {
        return setIsBlocked(false);
      }

      for (const key of Object.keys(data)) {
        const allDbRef = await get(ref(realtimeDb, key));

        // 데이터가 존재하면서
        // 데이터의 키(userId)가 요청을 보낸 사용자의 key(userId)와 다를 때(키는 달라도 데이터는 같을 수 있기 때문에 중복 제거)
        if (allDbRef.exists() && key !== `${user.uid}_change`) {
          const values = allDbRef.val();
          const value = Object.keys(values);

          // 요청 데이터 안에 본인이 예매한 티켓의 좌석 데이터(요청 보낼 데이터)가 포함되면 그 티켓에서는 좌석 변경 불가
          if (
            value.includes(
              `${groupSeats[0].id}_${groupSeats[0].trainNoId}_${groupSeats.map((item) => item.seatId)}`,
            )
          ) {
            return setIsBlocked(true);
          }
        }
      }
    };
    seatsChangeBlocked();
  }, [groupSeats, seatsTarget]);

  return { isBlocked };
};
