import { SeatType } from '@/entities/Seat/types/seatType';
import { NotificationModalTypes } from '@/shared/types/ModalType';
import { Timestamp } from 'firebase/firestore';

export type Store = {
  modalType: NotificationModalTypes | null;
  isShow: boolean;
  openModal: (type: NotificationModalTypes) => void;
  closeModal: (type: NotificationModalTypes) => void;
};

export type NotificationRequestProps = {
  requestTitle: string;
  requstTime: Timestamp;
  requsetContant: SeatType[];
};
