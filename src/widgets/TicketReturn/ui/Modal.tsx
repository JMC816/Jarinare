import useModalStore from '@/widgets/model/TicketReturnStore';
import TicketReturnModal from './TicketReturnModal';

const Modal = () => {
  const { modalType, isShow } = useModalStore();
  return (
    <div className="fixed mx-auto my-0 h-[667px] w-[375px]">
      {isShow == true && modalType == 'ReturnModal' ? (
        <TicketReturnModal />
      ) : null}
    </div>
  );
};

export default Modal;
