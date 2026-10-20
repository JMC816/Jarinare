import type { SeatType } from '@/entities/Seat/types/seatType';

export interface MiniTicketItem {
  groups: SeatType[];
  ticket: SeatType;
  trainTypeName: string;
  startLabel: string;
  endLabel: string;
  startAmPm: string;
  endAmPm: string;
  dotDate: string;
  koreanDate: string;
  duration: string;
  ticketNo: string;
  startTimeStr: string;
  oddStops: string[];
  stopCount: number;
}

export type MiniTicketVariantProps = {
  variant?: 'pc';
  items: MiniTicketItem[];
  isEmpty: boolean;
};
