import { create } from 'zustand';
import { Store } from '../Auth/types/Auth';
import { AuthModalTypes } from '../types/Modal';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: AuthModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: AuthModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
