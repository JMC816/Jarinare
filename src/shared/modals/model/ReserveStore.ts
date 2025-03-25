import { create } from 'zustand';
import { ReserveModalTypes } from '../types/Modal';
import { Store } from '../TicketReserve/types/Reserve';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: ReserveModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: ReserveModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
