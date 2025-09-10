import { db } from '@/shared/firebase/firebase';
import { seatsStateStore } from '../models/seatsStateStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';

export const useGetSeatsState = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const {
    trainNo,
    selectStartTime,
    selectTrainType,
    startDay,
    endStationForView,
    startStationForView,
  } = trainDataStore();
  const { seatsChangeInfo, setSeatsChangeInfo } = seatsChangeInfoStore();
  const { setIsSeatsChangeTarget } = seatsChangeTargetStore();
  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();

  const location = useLocation();

  const docIds = `${startDay}_${selectStartTime}_${selectTrainType}_${startStationForView}_${endStationForView}`;

  // 선택된 좌석 수
  const selectedCount = Object.values(seatsState).filter(Boolean).length;

  // 좌석 변경 페이지를 벗어나면 좌석 선택 상태 초기화
  useEffect(() => {
    if (location.pathname === '/seatchange') {
      setSeatsState({});
    }
  }, []);

  // 각 호차별 좌석 상태
  useEffect(() => {
    if (!trainNo) return;

    const seatsQuery = query(
      collection(db, 'train', docIds, 'no', trainNo, 'seats'),
      orderBy('createAt', 'asc'),
    );

    const unsub = onSnapshot(seatsQuery, (snap) => {
      const seats = snap.docs.map((item) => {
        const data = item.data();
        const ts: Timestamp = data.createAt;

        // serverTimestamp()는 처음엔 null일 수 있으므로 방어코드
        const createAtSeconds =
          typeof ts?.seconds === 'number'
            ? ts.seconds
            : typeof ts?.toMillis === 'function'
              ? Math.floor(ts.toMillis() / 1000)
              : 0;

        return {
          seatId: data.seatId,
          userId: data.userId,
          trainNoId: data.trainNoId,
          startDay: data.startDay,
          startTime: data.startTime,
          endTime: data.endTime,
          trainType: data.trainType,
          createAt: createAtSeconds,
          startDayForView: data.startDayForView,
          startStationForView: data.startStationForView,
          endStationForView: data.endStationForView,
          selectKid: data.selectKid,
          selectAdult: data.selectAdult,
          selectPay: data.selectPay,
          id: data.id,
        } as SeatType;
      });
      setSeatsChangeInfo(seats);
    });
    return () => unsub();
  }, [trainNo]);

  // 호차 변경시 변경활 좌석 상태 초기화
  useEffect(() => {
    setIsSeatsChangeTarget(false);
  }, [trainNo]);

  useEffect(() => {
    // 선택한 좌석 즉시 반영
    setSeatsStateCount(selectedCount);
  }, [seatsState]);

  return { seatsChangeInfo, seatsStateCount };
};
