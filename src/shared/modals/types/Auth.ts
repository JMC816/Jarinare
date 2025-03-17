import { ModalTypes } from './Modal';

export type Store = {
  modalType: ModalTypes | null;
  isShow: boolean;
  openModal: (type: ModalTypes) => void;
  closeModal: (type: ModalTypes) => void;
};
