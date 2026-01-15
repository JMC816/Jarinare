import { useDeleteNotification } from '@/features/Notification/hooks/useDeleteNotification';
import useModalStore from '../../model/Notification';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useHandleChange } from '@/features/TicketChange/hooks/useHandleChange';
import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';
import { useIsAcceptRequest } from '@/features/Notification/hooks/useIsAcceptRequest';

const ResponseModal = () => {
  const { openModal, closeModal } = useModalStore();
  const { seatIds } = responesBySeatIdStore();
  const { response } = useChangeResponse();
  const { handleClick } = useHandleChange();
  const { deleteRequsetAndResponse } = useDeleteNotification();
  const { accpetRequest, refuseRequest } = useIsAcceptRequest();

  if (!response) {
    return;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-darkGray/50">
      <div className="flex h-[200px] w-[260px] flex-col items-center rounded-2xl bg-white p-5 font-bold">
        <CrossModalButton closeModal={() => closeModal('ResponseModal')} />
        <div className="mt-[10px] flex w-full flex-col items-center text-base font-bold">
          <span>{seatIds.join(' • ')} 자리에서</span>
          <span>변경 요청이 들어왔습니다.</span>
          <span>자리를 변경하겠습니까?</span>
        </div>
        <div className="mt-[20px] flex gap-x-5 text-base font-bold">
          <button
            onClick={async () => {
              closeModal('ResponseModal');
              await refuseRequest(response);
              await deleteRequsetAndResponse(response);
            }}
            className="flex h-12 w-[100px] items-center justify-center rounded-xs border border-lightGray bg-lightBlue text-blue shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
          >
            거절
          </button>
          <button
            onClick={async () => {
              closeModal('ResponseModal');
              openModal('AcceptModal');
              await handleClick(response);
              await accpetRequest(response);
              await deleteRequsetAndResponse(response);
              setTimeout(() => {
                closeModal('AcceptModal');
              }, 1500);
            }}
            className="flex h-12 w-[100px] items-center justify-center rounded-xs border border-lightGray bg-blue text-white shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
          >
            수락
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
