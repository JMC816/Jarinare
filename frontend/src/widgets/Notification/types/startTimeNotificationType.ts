import { SeatType } from '@/entities/Seat/types/seatType';
import { Timestamp } from 'firebase/firestore';

export type StartTimeNotificationType = {
  createdAt: Timestamp;
  seats: SeatType[];
  onClick: () => void;
  isRead: boolean;
};
