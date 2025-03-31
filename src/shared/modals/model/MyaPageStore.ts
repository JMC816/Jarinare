import { create } from 'zustand';
import { MyPageModalTypes } from '../types/Modal';
import { Store } from '../MyPage/types/MyPage';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: MyPageModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: MyPageModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
