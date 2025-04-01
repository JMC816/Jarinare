import { create } from 'zustand';
import { NotificationModalTypes } from '../types/Modal';
import { Store } from '../Notification/types/Notification';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: NotificationModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: NotificationModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
