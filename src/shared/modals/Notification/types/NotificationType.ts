import { NotificationModalTypes } from './../../types/Modal';

export type Store = {
  modalType: NotificationModalTypes | null;
  isShow: boolean;
  openModal: (type: NotificationModalTypes) => void;
  closeModal: (type: NotificationModalTypes) => void;
};
