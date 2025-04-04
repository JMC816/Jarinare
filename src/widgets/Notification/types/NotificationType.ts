import { NotificationModalTypes } from '@/shared/types/ModalType';

export type Store = {
  modalType: NotificationModalTypes | null;
  isShow: boolean;
  openModal: (type: NotificationModalTypes) => void;
  closeModal: (type: NotificationModalTypes) => void;
};

export type NotificationRequestProps = {
  requestTitle: string;
  requstTime: string;
  requsetContant: string;
};
