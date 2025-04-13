import useModalStore from '@/widgets/model/AuthStore';
import EmailModal from './EmaiModal';
import PasswordModal from './PasswordModal';

// 모달 상태에 따라 Email , Password 입력 모달 렌더링
const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType === 'EmailModal' ? <EmailModal /> : null}
      {isShow == true && modalType === 'PasswordModal' ? (
        <PasswordModal />
      ) : null}
    </div>
  );
};

export default Modal;
