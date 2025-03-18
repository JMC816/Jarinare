import { ModalTypes } from '../modals/types/Modal';

export type ButtonProps = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: ModalTypes | null;
  stage?: string;
};

export type MiniButtonProp = {
  text: string;
};
