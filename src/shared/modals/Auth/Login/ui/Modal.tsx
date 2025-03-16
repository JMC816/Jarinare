import useModalStore from '../model/store';
import EmailModal from './EmaiModal';
import NumberModal from './NumberModal';
import PasswordModal from './PasswordModal';
import UserNumberModal from './UserNumberModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType === 'EmailModal' ? <EmailModal /> : null}
      {isShow == true && modalType === 'UserNumberModal' ? (
        <UserNumberModal />
      ) : null}
      {isShow == true && modalType === 'NumberModal' ? <NumberModal /> : null}
      {isShow == true && modalType === 'PasswordModal' ? (
        <PasswordModal />
      ) : null}
    </div>
  );
};

export default Modal;
