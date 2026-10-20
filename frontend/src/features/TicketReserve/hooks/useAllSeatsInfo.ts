/**
 * @role: features/hooks
 * @rule: 내 예매 전체 목록 캐싱·조회만 담당. 백엔드 GET /seats/reservations/me 사용
 */
import { useEffect } from 'react';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { SeatType } from '@/entities/Seat/types/seatType';
import { fetchMyReservations, orderDtoToSeatTypes } from '../api/reservationApi';

let cachedSeatsAllInfo: SeatType[] = [];
let isFetching = false;
const listeners: Array<(seats: SeatType[]) => void> = [];

const notifyListeners = (seats: SeatType[]) => {
  cachedSeatsAllInfo = seats;
  listeners.forEach((fn) => fn(seats));
};

export const prefetchAllSeats = async () => {
  if (isFetching || cachedSeatsAllInfo.length > 0) return;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return;

  isFetching = true;
  try {
    const orders = await fetchMyReservations();
    const seats = orderDtoToSeatTypes(orders, 'me');
    notifyListeners(seats);
  } catch {
    notifyListeners([]);
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
    if (cachedSeatsAllInfo.length > 0) {
      onUpdate(cachedSeatsAllInfo);
    }
    listeners.push(onUpdate);
    return () => {
      const idx = listeners.indexOf(onUpdate);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);
};
