import { create } from 'zustand';
import { Store } from '../MyPage/types/MyPageType';
import { MyPageModalTypes } from '../types/ModalType';

const useModalStore = create<Store>((set) => ({
  modalType: null,
  isShow: false,
  openModal: (type: MyPageModalTypes) =>
    set(() => ({ isShow: true, modalType: type })),
  closeModal: (type: MyPageModalTypes) =>
    set(() => ({ isShow: false, modalType: type })),
}));

export default useModalStore;
