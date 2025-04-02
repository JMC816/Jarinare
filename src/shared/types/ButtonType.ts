import { AuthModalTypes, ReserveModalTypes } from '../modals/types/ModalType';

export type ButtonProps = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: AuthModalTypes | null;
  stage?: string;
  onModalClick?: (type: AuthModalTypes | ReserveModalTypes) => void;
};

export type MiniButtonProp = {
  text: string;
  modalTypes?: ReserveModalTypes | null;
};
