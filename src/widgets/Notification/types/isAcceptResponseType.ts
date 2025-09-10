import { SeatType } from '@/entities/Seat/types/seatType';
import { Timestamp } from 'firebase/firestore';

export type IsAcceptRepsonseProps = {
  responseTitle: string;
  responseTime: Timestamp;
  responseContant: SeatType[];
  responseDeleteContant: SeatType[];
};
