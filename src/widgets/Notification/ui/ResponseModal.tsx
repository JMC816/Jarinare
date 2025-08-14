import { useDeleteNotification } from '@/features/Notification/hooks/useDeleteNotification';
import useModalStore from '../../model/Notification';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useHandleChange } from '@/features/TicketChange/hooks/useHandleChange';

const ResponseModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { seatIds } = responesBySeatIdStore();
  const { response } = useChangeResponse();
  const { handleClick } = useHandleChange();
  const { deleteRequsetAndResponse } = useDeleteNotification();

  if (!response) {
    return;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[270px] w-[260px] flex-col items-center rounded-2xl bg-white font-bold">
        <div className="mt-[60px] flex flex-col items-center text-base font-bold">
          <span>{seatIds.join(' • ')} 자리에서</span>
          <span>변경 요청이 들어왔습니다.</span>
          <span>자리를 변경하겠습니까?</span>
        </div>
        <div className="mt-[30px] flex gap-x-5 text-base font-bold">
          <button
            onClick={() => closeModal('ResponseModal')}
            className="flex h-12 w-[100px] items-center justify-center rounded-xs bg-lightImpossible text-red active:brightness-50"
          >
            거절
          </button>
          <button
            onClick={async () => {
              closeModal('ResponseModal');
              openModal('AcceptModal');
              await handleClick(response);
              await deleteRequsetAndResponse(response);
              setTimeout(() => {
                closeModal('AcceptModal');
              }, 1500);
            }}
            className="flex h-12 w-[100px] items-center justify-center rounded-xs bg-blue text-white active:brightness-50"
          >
            수락
          </button>
        </div>
        <button
          onClick={() => closeModal('ResponseModal')}
          className="mt-5 flex h-12 w-[220px] items-center justify-center rounded-xs bg-lightBlue text-base font-bold text-blue active:brightness-50"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default ResponseModal;
