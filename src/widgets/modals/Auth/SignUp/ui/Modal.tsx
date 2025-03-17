import NumberModal from '@/shared/modals/Auth/SignUp/ui/NumberModal';
import PasswordModal from '@/shared/modals/Auth/SignUp/ui/PasswordModal';
import useModalStore from '@/shared/modals/model/store';

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
