import { ModalTypes } from '../modals/Auth/Login/types/Modal';

export type Props = {
  bgColor: string;
  textColor: string;
  text: string;
  icon?: string;
  modalTypes?: ModalTypes | null;
  stage: string;
};
