import useModalStore from '@/shared/modals/model/Notification';
import AcceptModal from '@/shared/modals/Notification/ui/AcceptModal';
import ResponseModal from '@/shared/modals/Notification/ui/ResponseModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType == 'ResponseModal' ? (
        <ResponseModal />
      ) : null}
      {isShow == true && modalType == 'AcceptModal' ? <AcceptModal /> : null}
    </div>
  );
};

export default Modal;
