import { TicketReturnModalTypes } from '@/shared/types/ModalType';

export type Store = {
  modalType: TicketReturnModalTypes | null;
  isShow: boolean;
  openModal: (type: TicketReturnModalTypes) => void;
  closeModal: (type: TicketReturnModalTypes) => void;
};

export type TicketReturnButtonProps = {
  text: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
};
