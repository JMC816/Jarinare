/**
 * @role: features/api
 * @rule: 좌석·예매·선점·운행편 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { SeatType } from '@/entities/Seat/types/seatType';

export interface TicketDto {
  reservationId: number;
  carNo: number;
  seatId: string;
  passengerType: string;
  price: number;
  inspected: boolean;
}

export interface TripDto {
  tripId: number;
  trainNo: string;
  trainType: string;
  depPlaceId: string;
  arrPlaceId: string;
  depPlandTime: string;
  arrPlandTime: string;
  depName: string;
  arrName: string;
}

export interface OrderDto {
  orderId: string;
  trip: TripDto;
  adult: number;
  kid: number;
  totalPrice: number;
  tickets: TicketDto[];
}

export interface SeatStatusDto {
  seatId: string;
  rowNo: number;
  colLabel: string;
  side: string;
  isWindow: boolean;
  state: 'AVAILABLE' | 'HELD' | 'HELD_BY_ME' | 'RESERVED' | 'MINE';
}

export interface CarSeatsDto {
  trip: TripDto;
  carNo: number;
  rowCount: number;
  columns: string[][];
  totalSeats: number;
  availableCount: number;
  myHoldExpiresAt: string | null;
  seats: SeatStatusDto[];
}

// OrderDto → SeatType[] 변환 (createAt = 같은 주문의 최소 reservationId)
export const orderDtoToSeatTypes = (orders: OrderDto[], userId: string): SeatType[] =>
  orders.flatMap((order) => {
    const minId = Math.min(...order.tickets.map((t) => t.reservationId));
    return order.tickets.map((ticket): SeatType => ({
      seatId: ticket.seatId,
      userId,
      trainNoId: String(ticket.carNo),
      startDay: order.trip.depPlandTime.substring(0, 8),
      startTime: Number(order.trip.depPlandTime),
      endTime: Number(order.trip.arrPlandTime),
      trainType: order.trip.trainType,
      createAt: minId,
      startDayForView: '',
      startStationForView: order.trip.depName,
      endStationForView: order.trip.arrName,
      selectKid: order.kid,
      selectAdult: order.adult,
      selectPay: order.totalPrice,
      id: `${order.trip.depPlaceId}_${order.trip.depPlandTime}`,
      reservationId: ticket.reservationId,
      tripId: order.trip.tripId,
      inspected: ticket.inspected,
    }));
  });

export const upsertTrip = async (dto: {
  trainNo: string;
  trainType: string;
  depPlaceId: string;
  arrPlaceId: string;
  depPlandTime: string;
  arrPlandTime: string;
  depName: string;
  arrName: string;
}): Promise<TripDto> => {
  const { data } = await backendClient.post<TripDto>('/api/seats/trips', dto);
  return data;
};

export const fetchMyReservations = async (): Promise<OrderDto[]> => {
  const { data } = await backendClient.get<OrderDto[]>('/api/seats/reservations/me');
  return data;
};

export const createReservation = async (dto: {
  tripId: number;
  carNo: number;
  seatIds: string[];
  adult: number;
  kid: number;
  totalPrice: number;
  usedPoint?: number;
  paybackPoint?: number;
  paymentMethod?: string;
  selectedCard?: string | null;
  startDayForView?: string;
}): Promise<OrderDto> => {
  const { data } = await backendClient.post<OrderDto>('/api/seats/reservations', dto);
  return data;
};

export const cancelReservation = async (reservationIds: number[]): Promise<{ canceled: number }> => {
  const { data } = await backendClient.delete<{ canceled: number }>('/api/seats/reservations', {
    data: { reservationIds },
  });
  return data;
};

export const fetchCarSeats = async (tripId: number, carNo: number): Promise<CarSeatsDto> => {
  const { data } = await backendClient.get<CarSeatsDto>(`/api/seats/trips/${tripId}/cars/${carNo}`);
  return data;
};

export const holdSeats = async (tripId: number, carNo: number, seatIds: string[]): Promise<void> => {
  await backendClient.post('/api/seats/holds', { tripId, carNo, seatIds });
};

export const releaseHolds = async (tripId: number, carNo?: number, seatIds?: string[]): Promise<void> => {
  await backendClient.delete('/api/seats/holds', { data: { tripId, carNo, seatIds } });
};
