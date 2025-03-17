import { ModalTypes } from '../modals/types/Modal';

export type Props = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: ModalTypes | null;
  stage?: string;
};

export type AuthContents = {
  title: string;
  subtitle: string;
  placeholder: string;
};

export type AuthPlaceholer = {
  placeholder: string;
};

export type AuthStage = {
  stage: string;
};
