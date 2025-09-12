import request from '@/assets/icons/request.png';
import { seatsStateStore } from '@/features/TicketChange/models/seatsStateStore';
import { seatsTargetStore } from '@/features/TicketChange/models/seatsTargetStore';

const RequestChangeModal = () => {
  const { seatsState } = seatsStateStore();

  const target = seatsTargetStore().seatsTarget;

  const emptySeatsTarget = Object.entries(seatsState)
    .filter(([, value]) => value === true)
    .map(([key]) => key);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[150px] w-[200px] flex-col items-center justify-center rounded-2xl bg-white font-bold text-blue">
        <img src={request} width={40} height={40} />
        <span className="mt-[25px]">
          {target.length === emptySeatsTarget.length
            ? '자리가 변경되었습니다!'
            : '자리 요청을 보냈습니다!'}
        </span>
      </div>
    </div>
  );
};

export default RequestChangeModal;
