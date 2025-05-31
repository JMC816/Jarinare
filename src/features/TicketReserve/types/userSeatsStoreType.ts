import { SeatType } from '@/entities/Seat/types/seatType';

export type UserSeatsStoreType = {
  userSeats: SeatType[];
  setUserSeats: (type: SeatType[]) => void;
};
