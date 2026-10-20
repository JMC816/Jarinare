import useModalStore from '@/widgets/model/Notification';
import ResponseModal from './ResponseModal';
import AcceptModal from './AcceptModal';
import ExpiredModal from './ExpiredModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-screen w-[375px]">
      {isShow == true && modalType == 'ResponseModal' ? (
        <ResponseModal />
      ) : null}
      {isShow == true && modalType == 'AcceptModal' ? <AcceptModal /> : null}
      {isShow == true && modalType == 'ExpiredModal' ? <ExpiredModal /> : null}
    </div>
  );
};

export default Modal;
