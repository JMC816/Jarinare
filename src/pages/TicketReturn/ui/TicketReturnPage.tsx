import Ticket from '@/shared/ui/Ticket';
import arrow from '@/assets/icons/arrow.png';
import TicketButton from '@/shared/ui/TicketButton';
import useModalStore from '@/widgets/model/TicketReturnStore';
import Modal from '@/widgets/TicketReturn/ui/Modal';

const TicketReturnPage = () => {
  const { isShow, modalType, openModal } = useModalStore();
  return (
    <div className="flex w-full flex-col items-center pl-[38px] pr-[37px]">
      <div className="mt-[30px] w-full">
        <div className="flex justify-center text-lg font-bold">
          <span>서울</span>
          <img src={arrow} width={25} height={20} className="mx-[30px]" />
          <span>대전</span>
        </div>
        <div className="mt-[55px]">
          <Ticket />
        </div>
        <div className="mt-[60px] flex flex-col">
          <TicketButton
            onClick={() => openModal('ReturnModal')}
            text="반환"
            bgColor="lightImpossible"
            textColor="red"
          />
        </div>
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default TicketReturnPage;
