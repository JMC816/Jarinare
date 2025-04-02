import { MyPageModalTypes } from '../../types/ModalType';

export type Store = {
  modalType: MyPageModalTypes | null;
  isShow: boolean;
  openModal: (type: MyPageModalTypes) => void;
  closeModal: (type: MyPageModalTypes) => void;
};
