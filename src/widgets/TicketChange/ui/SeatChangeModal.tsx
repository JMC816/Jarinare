import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import useModalStore from '../../model/TicketChangeStore';
import RequestChangeButton from './RequsetChangeButton';
import { useChangeRequest } from '@/features/Notification/hooks/useChangeRequest';
import { useNavigation } from '@/widgets/TicketList/hooks/useNavigation';

const SeatChangeModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { changeRequset } = useChangeRequest();
  const { navigate } = useNavigation();

  // 좌석 상태를 UI로만 보여주는 용도이므로 상태 구독을 하지 않는다.(리렌더링 최적화)
  const target = seatsTargetStore.getState().seatsTarget;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[200px] w-[260px] flex-col items-center rounded-2xl bg-white px-[20px] pt-[55px] font-bold">
        <span className="flex w-full justify-center text-base">
          {target.join(' • ')}
        </span>
        <span className="flex w-full justify-center text-base">
          변경 요청을 보내겠습니까?
        </span>
        <div className="mt-[30px] flex w-full justify-between text-base">
          <RequestChangeButton
            text="취소"
            bgColor="lightBlue"
            textColor="blue"
            onClick={() => closeModal('TrainNumberChoiceModal')}
          />
          <RequestChangeButton
            text="요청"
            bgColor="blue"
            textColor="white"
            onClick={async () => {
              closeModal('TrainNumberChoiceModal');
              await changeRequset(target);
              openModal('RequestChangeModal');
              setTimeout(() => {
                closeModal('RequestChangeModal');
                navigate('/');
              }, 1500);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SeatChangeModal;
