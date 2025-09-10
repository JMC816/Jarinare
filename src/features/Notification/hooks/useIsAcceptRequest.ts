import { realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, ref, serverTimestamp, set } from 'firebase/database';
import { responesBySeatIdTrainNoIdStore } from '../models/responseBySeatIdAndTrainNoIdStore';
import { SeatType } from '@/entities/Seat/types/seatType';

export const useIsAcceptRequest = () => {
  const { seatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();

  // 수락 시 상대방에게 수락 알림 전송
  const accpetRequest = async (response: DataSnapshot) => {
    if (!response) return;
    const keys = Object.keys(response.val());

    // 변경 요청을 보낸 좌석 데이터로 만들어진 key
    const filteredKey = keys.filter((item) =>
      item.includes(
        `${seatIdsAndTrainNoId[0].id}_${seatIdsAndTrainNoId[0].trainNoId}_${seatIdsAndTrainNoId[0].seatId}`,
      ),
    );

    const mySeats = response.val()[filteredKey[0]].mySeat as SeatType[];
    const targetSeats = response.val()[filteredKey[0]].targetSeat as SeatType[];

    await set(
      ref(
        realtimeDb,
        `${mySeats[0].userId}_accept/${mySeats[0].id}_${mySeats[0].trainNoId}_${mySeats.map((item) => item.seatId)}`,
      ),
      {
        text: '수락',
        createdAt: serverTimestamp(),
        mySeats,
        targetSeats,
      },
    );
  };

  // 거절 시 상대방에게 거절 알림 전송
  const refuseRequest = async (response: DataSnapshot) => {
    if (!response) return;
    const keys = Object.keys(response.val());

    // 변경 요청을 보낸 좌석 데이터로 만들어진 key
    const filteredKey = keys.filter((item) =>
      item.includes(
        `${seatIdsAndTrainNoId[0].id}_${seatIdsAndTrainNoId[0].trainNoId}_${seatIdsAndTrainNoId[0].seatId}`,
      ),
    );

    const mySeats = response.val()[filteredKey[0]].mySeat as SeatType[];
    const targetSeats = response.val()[filteredKey[0]].targetSeat as SeatType[];

    await set(
      ref(
        realtimeDb,
        `${mySeats[0].userId}_refuse/${mySeats[0].id}_${mySeats[0].trainNoId}_${mySeats.map((item) => item.seatId)}`,
      ),
      {
        text: '거절',
        createdAt: serverTimestamp(),
        mySeats,
        targetSeats,
      },
    );
  };
  return { accpetRequest, refuseRequest };
};
