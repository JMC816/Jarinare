import { create } from 'zustand';
import { Store } from '../TicketChange/types/TicketChange';
import { TicketChangeModalTypes } from '../types/Modal';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: TicketChangeModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: TicketChangeModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
