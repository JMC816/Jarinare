import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import { auth, realtimeDb } from '@/shared/firebase/firebase';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const useSeatsChangeBlocked = () => {
  const location = useLocation();
  const { seatsTarget } = seatsTargetStore();
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const user = auth.currentUser;

  const mySeats: SeatType[] = location.state;

  useEffect(() => {
    const seatsChangeBlocked = async () => {
      if (!user) return;

      const snapshot = await get(ref(realtimeDb));
      const data = Object(snapshot.val());

      // 데이터가 존재하지 않으면 좌석 변경 가능
      if (!data || data === undefined) {
        return setIsBlocked(false);
      }

      const filteredKeys = Object.keys(data).filter((key) => key !== 'locks');

      for (const key of filteredKeys) {
        const allDbRef = await get(ref(realtimeDb, key));

        // 데이터가 존재하면서
        // 데이터의 키(userId)가 요청을 보낸 사용자의 key(userId)와 다를 때(키는 달라도 데이터는 같을 수 있기 때문에 중복 제거)
        if (allDbRef.exists() && key !== `${user.uid}_change`) {
          const values = allDbRef.val();
          const value = Object.keys(values);

          // 요청 데이터 안에 본인이 예매한 티켓의 좌석 데이터(요청 보낼 데이터)가 포함되면 그 티켓에서는 좌석 변경 불가
          if (
            value.includes(
              `${mySeats[0]?.id}_${mySeats[0]?.trainNoId}_${mySeats.map((item) => item.seatId)}`,
            )
          ) {
            return setIsBlocked(true);
          }
        }
      }
    };
    seatsChangeBlocked();
  }, [mySeats, seatsTarget]);

  return { isBlocked };
};
