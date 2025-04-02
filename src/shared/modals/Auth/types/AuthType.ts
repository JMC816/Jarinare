import { AuthModalTypes } from '../../types/ModalType';

export type Store = {
  modalType: AuthModalTypes | null;
  isShow: boolean;
  openModal: (type: AuthModalTypes) => void;
  closeModal: (type: AuthModalTypes) => void;
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
