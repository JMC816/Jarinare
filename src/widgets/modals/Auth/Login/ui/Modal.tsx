import EmailModal from '@/shared/modals/Auth/Login/ui/EmaiModal';
import NumberModal from '@/shared/modals/Auth/Login/ui/NumberModal';
import PasswordModal from '@/shared/modals/Auth/Login/ui/PasswordModal';
import UserNumberModal from '@/shared/modals/Auth/Login/ui/UserNumberModal';
import useModalStore from '@/shared/modals/model/AuthStore';

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
