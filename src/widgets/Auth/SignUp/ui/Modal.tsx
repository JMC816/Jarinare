import useModalStore from '@/widgets/model/AuthStore';
import NumberModal from './NumberModal';
import PasswordModal from './PasswordModal';

// 모달 상태에 따라 이름 , Password 입력 모달 렌더링
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
