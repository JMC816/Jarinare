import { ModalTypes } from './Modal';

export type Store = {
  modalType: ModalTypes | null;
  isShow: boolean;
  openModal: (type: ModalTypes) => void;
  closeModal: (type: ModalTypes) => void;
};

export type LoginContants = {
  title: string;
  subtitle: string;
  placeholder: string;
  stage: string;
};

export type LoginPlaceholer = {
  placeholder: string;
};

export type LoginStage = {
  stage: string;
};
