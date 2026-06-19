import { useEffect } from 'react';
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '@/shared/firebase/firebase';
import { SeatType } from '@/entities/Seat/types/seatType';

let cachedSeatsAllInfo: SeatType[] = [];
let isFetching = false;
const listeners: Array<(seats: SeatType[]) => void> = [];

const notifyListeners = (seats: SeatType[]) => {
  cachedSeatsAllInfo = seats;
  listeners.forEach((fn) => fn(seats));
};

export const prefetchAllSeats = async () => {
  if (isFetching || cachedSeatsAllInfo.length > 0) return;
  const user = auth.currentUser;
  if (!user) return;

  isFetching = true;
  const trainNos = ['1', '2', '3', '4'];
  let allSeats: SeatType[] = [];

  try {
    const trainCol = await getDocs(collection(db, 'train'));
    await Promise.all(
      trainCol.docs.map(async (trainDoc) => {
        for (const trainNoId of trainNos) {
          const seatsQuery = query(
            collection(db, 'train', trainDoc.id, 'no', trainNoId, 'seats'),
            orderBy('createAt'),
          );
          const existSeats = await getDocs(seatsQuery);
          const seats = existSeats.docs.map((item) => {
            const data = item.data();
            const ts: Timestamp = data.createAt;
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
          allSeats = [...allSeats, ...seats];
        }
      }),
    );
    notifyListeners(allSeats);
  } catch (e) {
    console.log(e);
  } finally {
    isFetching = false;
  }
};

export const getCachedAllSeats = () => cachedSeatsAllInfo;

export const clearAllSeatsCache = () => {
  cachedSeatsAllInfo = [];
};

export const useAllSeatsInfo = (onUpdate: (seats: SeatType[]) => void) => {
  useEffect(() => {
    // 캐시된 데이터가 있으면 즉시 반영
    if (cachedSeatsAllInfo.length > 0) {
      onUpdate(cachedSeatsAllInfo);
    }
    // 항상 listener 등록 — 이후 prefetchAllSeats 완료 시 업데이트 수신
    listeners.push(onUpdate);
    return () => {
      const idx = listeners.indexOf(onUpdate);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);
};
