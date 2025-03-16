import { ModalTypes } from '../modals/Auth/Login/types/modal';

export type Props = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: ModalTypes | null;
};
