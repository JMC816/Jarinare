import useModalStore from '@/shared/modals/model/ReserveStore';
import Button from '@/shared/ui/Button';
import Modal from '@/widgets/modals/TicketReserve/ui/Modal';
import ReserveTicket from '@/widgets/TicketReserve/ui/ReserveTicket';
import ReserveTitle from '@/widgets/TicketReserve/ui/ReserveTitle';
import ReserveWay from '@/widgets/TicketReserve/ui/ReserveWay';

const HomePage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div
      className={`flex flex-col items-center pl-[28px] pr-[27px] ${isShow === true ? 'overflow-hidden' : null}`}
    >
      <ReserveTitle text="어디로 갈까요?" />
      <ReserveWay />
      <div className="mt-5">
        <Button text="조회" textColor="white" bgColor="blue" />
      </div>
      <ReserveTitle text="내 승차권" />
      <ReserveTicket />
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default HomePage;
