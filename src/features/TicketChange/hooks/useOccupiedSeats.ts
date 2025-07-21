import { db } from '@/shared/firebase/firebase';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { doc, runTransaction } from 'firebase/firestore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';

export const useOccupiedSeats = () => {
  const { groupSeats } = groupSeatsStore();
  const { seatsChangeTarget } = seatsChangeTargetStore();

  const occupiedSeatsChange = async () => {
    await runTransaction(db, async (transaction) => {
      const mySeatDocs = [];
      const targetSeatDocs = [];

      // 각 좌석을 배열에 저장
      for (let i = 0; i < groupSeats.length; i++) {
        const mySeatRef = doc(
          db,
          'train',
          groupSeats[i].id,
          'no',
          groupSeats[i].trainNoId,
          'seats',
          groupSeats[i].seatId,
        );

        const targetSeatRef = doc(
          db,
          'train',
          seatsChangeTarget[i].id,
          'no',
          seatsChangeTarget[i].trainNoId,
          'seats',
          seatsChangeTarget[i].seatId,
        );

        const mySeat = await transaction.get(mySeatRef);
        const targetSeat = await transaction.get(targetSeatRef);

        if (!mySeat.exists() || !targetSeat.exists()) return;

        // 각 좌석의 위치와 좌석 정보를 배열에 저장
        mySeatDocs.push({ ref: mySeatRef, data: mySeat.data() });
        targetSeatDocs.push({
          ref: targetSeatRef,
          data: targetSeat.data(),
        });
      }

      // 저장된 배열을 순회하면서 좌석을 교체
      for (let i = 0; i < groupSeats.length; i++) {
        const mySeatInfo = mySeatDocs[i];
        const targetSeatInfo = targetSeatDocs[i];

        // 현재 사용자의 위치에 맞게 상대방의 정보를 가져와 업데이트
        transaction.update(mySeatInfo.ref, {
          userId: targetSeatInfo.data.userId,
          selectAdult: targetSeatInfo.data.selectAdult,
          selectKid: targetSeatInfo.data.selectKid,
          selectPay: targetSeatInfo.data.selectPay,
          startStationForView: targetSeatInfo.data.startStationForView,
          endStationForView: targetSeatInfo.data.endStationForView,
        });

        // 상대방의 위치에 맞게 현재 사용자의 정보를 가져와 업데이트
        transaction.update(targetSeatInfo.ref, {
          userId: mySeatInfo.data.userId,
          selectAdult: mySeatInfo.data.selectAdult,
          selectKid: mySeatInfo.data.selectKid,
          selectPay: mySeatInfo.data.selectPay,
          startStationForView: mySeatInfo.data.startStationForView,
          endStationForView: mySeatInfo.data.endStationForView,
        });
      }
    });
  };
  return { occupiedSeatsChange };
};
