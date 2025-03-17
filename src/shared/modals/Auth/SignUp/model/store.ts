import { create } from 'zustand';
import { Store } from '../types/Login';
import { ModalTypes } from '../types/Modal';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: ModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: ModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
