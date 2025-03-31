import { MyPageModalTypes } from '../../types/Modal';

export type Store = {
  modalType: MyPageModalTypes | null;
  isShow: boolean;
  openModal: (type: MyPageModalTypes) => void;
  closeModal: (type: MyPageModalTypes) => void;
};
