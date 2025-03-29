import { ModalTypes, ReserveModalTypes } from '../modals/types/Modal';

export type ButtonProps = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: ModalTypes | null;
  stage?: string;
  onModalClick?: (type: ModalTypes | ReserveModalTypes) => void;
};

export type MiniButtonProp = {
  text: string;
  modalTypes?: ReserveModalTypes | null;
};
