import { create } from 'zustand';
import { ModalTypes } from '../types/Modal';
import { Store } from '../Auth/types/Auth';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: ModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: ModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
