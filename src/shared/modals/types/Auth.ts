import { ModalTypes } from './Modal';

export type Store = {
  modalType: ModalTypes | null;
  isShow: boolean;
  openModal: (type: ModalTypes) => void;
  closeModal: (type: ModalTypes) => void;
};

export type AuthContentsProps = {
  title: string;
  subtitle: string;
  placeholder: string;
};

export type AuthPlaceholerProp = {
  placeholder: string;
};

export type AuthStageProps = {
  stage: string;
};
