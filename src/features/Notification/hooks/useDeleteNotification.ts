import { SeatType } from '@/entities/Seat/types/seatType';
import { realtimeDb } from '@/shared/firebase/firebase';
import { DataSnapshot, ref, remove } from 'firebase/database';
import { responesBySeatIdTrainNoIdStore } from '../models/responseBySeatIdAndTrainNoIdStore';
import { deleteLocksByRequestStore } from '../models/deleteLocksByRequestStore';
import { deleteLocksByResponseStore } from '../models/deleteLocksByResponseStore';

export const useDeleteNotification = () => {
  const { seatIdsAndTrainNoId } = responesBySeatIdTrainNoIdStore();
  const { requestDocsId, requestTrainNo, requestSeatId } =
    deleteLocksByRequestStore();
  const { responseDocsId, responseTrainNo, responseSeatId } =
    deleteLocksByResponseStore();

  const deleteRequsetAndResponse = async (response: DataSnapshot) => {
    const keys = Object.keys(response.val());

    // 변경 요청을 보낸 좌석 데이터로 만들어진 key
    const filteredKey = keys.filter((item) =>
      item.includes(
        `${seatIdsAndTrainNoId[0].trainNoId}_${seatIdsAndTrainNoId[0].seatId}`,
      ),
    );

    const mySeats = response.val()[filteredKey[0]].mySeat as SeatType[];
    const targetSeats = response.val()[filteredKey[0]].targetSeat as SeatType[];

    // 키를 이용하여 알림 수락시 해당 요청 제거
    const requestRef = ref(
      realtimeDb,
      `${targetSeats[0].userId}_change/${mySeats[0].id}_${mySeats[0].trainNoId}_${mySeats.map((item) => item.seatId)}`,
    );
    await remove(requestRef);

    // 요청 보낸 사람의 좌석 자금 해제
    requestSeatId.map(async (item) => {
      const seatLockRef = ref(
        realtimeDb,
        `locks/${requestDocsId}/${requestTrainNo}/${item}`,
      );
      await remove(seatLockRef);
    });

    // 요청 받은 사람의 좌석 자금 해제
    responseSeatId.map(async (item) => {
      const seatLockRef = ref(
        realtimeDb,
        `locks/${responseDocsId}/${responseTrainNo}/${item}`,
      );
      await remove(seatLockRef);
    });
  };
  return { deleteRequsetAndResponse };
};
