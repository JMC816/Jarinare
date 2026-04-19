import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';
import useModalStore from '../../model/TicketChangeStore';
import { useChangeRequest } from '@/features/Notification/hooks/useChangeRequest';
import { useNavigation } from '@/widgets/TicketList/hooks/useNavigation';

const SeatChangeModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { changeRequset } = useChangeRequest();
  const { navigate } = useNavigation();

  // 좌석 상태를 UI로만 보여주는 용도이므로 상태 구독을 하지 않는다.(리렌더링 최적화)
  const target = seatsTargetStore.getState().seatsTarget;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('TrainNumberChoiceModal')}
    >
      <div
        className="mb-4 w-[343px] animate-slide-up rounded-3xl bg-white px-6 pb-8 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div className="mb-5 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <p className="mb-1 text-base font-bold text-gray-800">좌석 변경 요청</p>
        <p className="text-tiny text-darkGray">
          <span className="font-bold text-blue">{target.join(' • ')}</span>{' '}
          자리로 변경 요청을 보내겠습니까?
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => closeModal('TrainNumberChoiceModal')}
            className="flex-1 rounded-2xl border border-lightGray bg-lightBlue py-3.5 text-base font-bold text-blue active:brightness-95"
          >
            취소
          </button>
          <button
            onClick={async () => {
              closeModal('TrainNumberChoiceModal');
              await changeRequset(target);
              openModal('RequestChangeModal');
              setTimeout(() => {
                closeModal('RequestChangeModal');
                navigate('/');
              }, 1500);
            }}
            className="flex-[2] rounded-2xl bg-blue py-3.5 text-base font-bold text-white active:brightness-95"
          >
            요청
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatChangeModal;
