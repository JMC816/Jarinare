import { useMixSeats } from './useMixSeats';
import { useOccupiedSeats } from './useOccupiedSeats';
import { DataSnapshot } from 'firebase/database';
import { SeatType } from '@/entities/Seat/types/seatType';
import { responesBySeatIdTrainNoIdStore } from '@/features/Notification/models/responseBySeatIdAndTrainNoIdStore';
import {
  addDoc,
  collection,
  doc,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';

export const useHandleChange = () => {
  const { occupiedSeatsChange } = useOccupiedSeats();
  const { mixSeatsChange } = useMixSeats();
  const { seatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();
  const { point } = useGetPoint();

  // keepSeats : 바꿀 좌석들(빈 좌석 선택시 이전에 선택한 기존 좌석으로 업데이트)
  // seatsChangeTarget : 바꿀 좌석들(빈 좌석도 포함된다)
  // isSeatsChangeTarget: 좌석이 있으면 true, 빈 좌석이면 false
  const handleClick = async (response: DataSnapshot) => {
    const user = auth.currentUser;
    if (!user) return;

    const keys = Object.keys(response.val());

    const filteredKey = keys.filter((item) =>
      item.includes(
        `${seatIdsAndTrainNoId[0].trainNoId}_${seatIdsAndTrainNoId[0].seatId}`,
      ),
    );

    const mySeat = response.val()[filteredKey[0]].mySeat as SeatType[];

    const seatsChangeTarget = response.val()[filteredKey[0]]
      .targetSeat as SeatType[];

    const newKeepSeats = response.val()[filteredKey[0]].keepSeats as SeatType[];

    const emptySeatsTarget = response.val()[filteredKey[0]]
      .emptySeatsTarget as string[];

    const mixSeatId = response.val()[filteredKey[0]].mixTarget
      .seatsChangeMixTargetSeatId as string[];

    const isSeatsChangeTarget = response.val()[filteredKey[0]]
      .isSeatsChangeTarget as boolean;

    if (
      mySeat.length > newKeepSeats.length &&
      newKeepSeats.length !== 0 &&
      isSeatsChangeTarget === false
    ) {
      await mixSeatsChange(emptySeatsTarget, mySeat, newKeepSeats, mixSeatId);

      // 카운터가 5의 배수면 포인트 2000 증가
      return await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user!.uid);
        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();

          transaction.update(userRef, {
            changeCount: increment(1),
            // 최근 카운터가 반영되기 전이라 +1
            point: increment((data.changeCount + 1) % 5 === 0 ? 2000 : 0),
          });
          // 카운터가 5의 배수면 포인트 누적 값 기록
          if ((data.changeCount + 1) % 5 === 0) {
            addDoc(collection(db, 'payments', user!.uid, 'detail'), {
              addPoint: point + 2000,
              createAt: serverTimestamp(),
            });
          }
        }
      });
    }
    if (
      mySeat.length === seatsChangeTarget.length &&
      isSeatsChangeTarget === true
    ) {
      await occupiedSeatsChange(mySeat, seatsChangeTarget);

      return await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user!.uid);

        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();

          transaction.update(userRef, {
            changeCount: increment(1),
            point: increment((data.changeCount + 1) % 5 === 0 ? 2000 : 0),
          });
          if ((data.changeCount + 1) % 5 === 0) {
            addDoc(collection(db, 'payments', user!.uid, 'detail'), {
              accruedPoint: point + 2000,
              createAt: serverTimestamp(),
            });
          }
        }
      });
    }
  };
  return { handleClick };
};
