import { auth, db } from '@/shared/firebase/firebase';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { seatsStateStore } from '../models/seatsStateStore';
import { doc, runTransaction } from 'firebase/firestore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const useEmptySeats = () => {
  const { seatsState } = seatsStateStore();
  const { groupSeats } = groupSeatsStore();
  const { trainNo } = trainDataStore();

  const user = auth.currentUser;

  const emptySeatsChange = async () => {
    if (!user) return;

    // 좌석 id가 true인 것만 추출
    const filtered = Object.entries(seatsState)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    // 좌석을 선택했을 때 예매된 좌석 개수랑 같지 않으면 update 실행 x
    if (filtered.length !== groupSeats.length) return;

    try {
      await runTransaction(db, async (transaction) => {
        const mySeatsDocs = [];

        // 예매된 좌석 불러오기
        for (let i = 0; i < groupSeats.length; i++) {
          const mySeatsRef = doc(
            db,
            'train',
            groupSeats[i].id,
            'no',
            groupSeats[i].trainNoId,
            'seats',
            groupSeats[i].seatId,
          );

          const mySeatsSnap = await transaction.get(mySeatsRef);

          if (!mySeatsSnap.exists()) return;

          mySeatsDocs.push({ ref: mySeatsRef, data: mySeatsSnap.data() });
        }

        for (let i = 0; i < groupSeats.length; i++) {
          const mySeat = mySeatsDocs[i];
          const newSeatId = filtered[i];

          const newSeatsRef = doc(
            db,
            'train',
            groupSeats[i].id,
            'no',
            trainNo,
            'seats',
            newSeatId,
          );

          // 기존 좌석은 삭제
          transaction.delete(mySeat.ref);

          // 새로운 좌석 생성
          transaction.set(newSeatsRef, {
            ...mySeat.data,
            trainNoId: trainNo,
            seatId: newSeatId,
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  };
  return { emptySeatsChange };
};
