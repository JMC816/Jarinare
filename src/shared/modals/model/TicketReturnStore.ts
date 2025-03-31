import { create } from 'zustand';
import { TicketReturnModalTypes } from '../types/Modal';
import { Store } from '../TicketReturn/types/TicketReturn';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: TicketReturnModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: TicketReturnModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
