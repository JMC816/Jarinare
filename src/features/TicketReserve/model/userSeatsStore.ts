import { create } from 'zustand';
import { SeatType } from '@/entities/Seat/types/seatType';
import { UserSeatsStoreType } from '../types/userSeatsStoreType';

export const userSeatsStore = create<UserSeatsStoreType>((set) => ({
  userSeats: [],
  setUserSeats: (userSeats: SeatType[]) => set(() => ({ userSeats })),
}));
