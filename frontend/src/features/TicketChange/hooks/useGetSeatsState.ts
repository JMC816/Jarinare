/**
 * @role: features/hooks
 * @rule: 좌석 변경 페이지의 호차 좌석 현황 조회만 담당. 백엔드 폴링 사용
 */
import { seatsStateStore } from '../models/seatsStateStore';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsChangeInfoStore } from '../models/seatsChangeInfoStore';
import { seatsChangeTargetStore } from '../models/seatsChangeTargetStore';
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';
import { fetchCarSeats } from '@/features/TicketReserve/api/reservationApi';

export const useGetSeatsState = () => {
  const { seatsState, setSeatsState } = seatsStateStore();
  const { trainNo } = trainDataStore();
  const { seatsChangeInfo, setSeatsChangeInfo } = seatsChangeInfoStore();
  const { setIsSeatsChangeTarget } = seatsChangeTargetStore();
  const { seatsStateCount, setSeatsStateCount } = seatsStateCountStore();

  const location = useLocation();
  const mySeats: SeatType[] = location.state;

  const selectedCount = Object.values(seatsState).filter(Boolean).length;
  const carNo = Number(trainNo) || 1;
  const tripId = mySeats?.[0]?.tripId;

  // 좌석 변경 페이지 진입 시 좌석 선택 상태 초기화
  useEffect(() => {
    if (location.pathname === '/seatchange') {
      setSeatsState({});
    }
  }, []);

  // 호차별 좌석 현황 폴링 (5초)
  useEffect(() => {
    if (!tripId || !carNo) return;
    let active = true;

    const load = async () => {
      try {
        const carData = await fetchCarSeats(tripId, carNo);
        if (!active) return;

        const seats: SeatType[] = carData.seats
          .filter((s) => s.state !== 'AVAILABLE' && s.state !== 'HELD_BY_ME')
          .map((s): SeatType => ({
            seatId: s.seatId,
            userId: s.state === 'MINE' ? 'me' : 'other',
            trainNoId: String(carNo),
            startDay: '',
            startTime: 0,
            endTime: 0,
            trainType: '',
            createAt: 0,
            startDayForView: '',
            startStationForView: '',
            endStationForView: '',
            selectKid: 0,
            selectAdult: 0,
            selectPay: 0,
            id: '',
          }));
        setSeatsChangeInfo(seats);
      } catch {
        // silent
      }
    };

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [tripId, carNo]);

  // 호차 변경 시 변경할 좌석 상태 초기화
  useEffect(() => {
    setIsSeatsChangeTarget(false);
  }, [trainNo]);

  useEffect(() => {
    setSeatsStateCount(selectedCount);
  }, [seatsState]);

  return { seatsChangeInfo, seatsStateCount };
};
