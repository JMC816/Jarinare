import { db } from '@/shared/firebase/firebase';
import { seatsStateStore } from '../models/seatsStateStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { groupSeatsStore } from '@/widgets/TicketList/model/groupSeatsStore';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';

export const useGetSeatsState = () => {
  const { setSeatsState } = seatsStateStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeInfo, setSeatsChangeInfo } = seatsChangeInfoStore();
  const { groupSeats } = groupSeatsStore();
  const { setIsSeatsChangeTarget } = seatsChangeTargetStore();

  const location = useLocation();

  // 좌석 변경 페이지를 벗어나면 좌석 선택 상태 초기화
  useEffect(() => {
    if (location.pathname === '/seatchange') {
      setSeatsState({});
    }
  }, []);

  // 각 호차별 좌석 상태
  useEffect(() => {
    const getSeats = async () => {
      const seatsQuery = query(
        collection(db, 'train', groupSeats[0].id, 'no', trainNo, 'seats'),
        orderBy('createAt'),
      );

      // db에 있는 seats 컬렉션을 가져온다.
      const existSeats = await getDocs(seatsQuery);

      const seats = existSeats.docs.map((doc) => {
        const data = doc.data();
        return {
          seatId: data.seatId,
          userId: data.userId,
          trainNoId: data.trainNoId,
          startDay: data.startDay,
          startTime: data.startTime,
          endTime: data.endTime,
          trainType: data.trainType,
          createAt: data.createAt.seconds,
          startDayForView: data.startDayForView,
          startStationForView: data.startStationForView,
          endStationForView: data.endStationForView,
          selectKid: data.selectKid,
          selectAdult: data.selectAdult,
          selectPay: data.selectPay,
          id: data.id,
        };
      });
      setSeatsChangeInfo(seats);

      // 호차 변경될 때 좌석 선택 초기화
      setSeatsState({});
    };
    getSeats();
  }, [trainNo]);

  // 호차 변경시 변경활 좌석 상태 초기화
  useEffect(() => {
    setIsSeatsChangeTarget(false);
  }, [trainNo]);

  return { seatsChangeInfo };
};
