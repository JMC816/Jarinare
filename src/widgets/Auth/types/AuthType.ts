import { AuthModalTypes } from '@/shared/types/ModalType';

export type Store = {
  modalType: AuthModalTypes | null;
  isShow: boolean;
  openModal: (type: AuthModalTypes) => void;
  closeModal: (type: AuthModalTypes) => void;
};

export type AuthStageProps = {
  stage: string;
};
