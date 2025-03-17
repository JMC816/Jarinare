import useModalStore from '../model/store';
import NumberModal from './NumberModal';
import PasswordModal from './PasswordModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType === 'NumberModal' ? <NumberModal /> : null}
      {isShow == true && modalType === 'PasswordModal' ? (
        <PasswordModal />
      ) : null}
    </div>
  );
};

export default Modal;
