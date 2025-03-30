import { TicketChangeModalTypes } from '../../types/Modal';

export type Store = {
  modalType: TicketChangeModalTypes | null;
  isShow: boolean;
  openModal: (type: TicketChangeModalTypes) => void;
  closeModal: (type: TicketChangeModalTypes) => void;
};

export type RequestChangeButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};
