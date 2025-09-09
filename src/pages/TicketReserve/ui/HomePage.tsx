import useModalStore from '@/widgets/model/ReserveStore';
import Modal from '@/widgets/TicketReserve/ui/Modal';
import ReserveButton from '@/widgets/TicketReserve/ui/ReserveButton';
import ReserveTicket from '@/widgets/TicketReserve/ui/ReserveTicket';
import ReserveTitle from '@/widgets/TicketReserve/ui/ReserveTitle';
import ReserveWay from '@/widgets/TicketReserve/ui/ReserveWay';
import { Link } from 'react-router-dom';
import { useResetTrainType } from '../hooks/homeHook';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const HomePage = () => {
  const { isShow, modalType } = useModalStore();
  const {
    startStationForView,
    endStationForView,
    startDayForView,
    adult,
    kid,
  } = trainDataStore();
  // home 페이지 렌더링 시 기차 종류 초기화
  useResetTrainType();

  const disabled =
    startStationForView === '' ||
    endStationForView === '' ||
    startDayForView === '' ||
    adult + kid === 0;

  return (
    <div
      className={`flex flex-col items-center pl-[28px] pr-[27px] ${isShow === true ? 'overflow-hidden' : null}`}
    >
      <ReserveTitle text="어디로 갈까요?" />
      <ReserveWay />
      <div className="mt-5">
        <Link to={'/reserve/trainCheck'}>
          <ReserveButton
            disabled={disabled}
            text="조회"
            textColor="white"
            bgColor="blue"
          />
        </Link>
      </div>
      <ReserveTitle text="내 승차권" />
      <ReserveTicket />
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default HomePage;
