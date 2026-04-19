import { useDeleteNotification } from '@/features/Notification/hooks/useDeleteNotification';
import useModalStore from '../../model/Notification';
import { responesBySeatIdStore } from '../model/responseBySeatIdStore';
import { useChangeResponse } from '@/features/Notification/hooks/useChangeResponse';
import { useHandleChange } from '@/features/TicketChange/hooks/useHandleChange';
import { useIsAcceptRequest } from '@/features/Notification/hooks/useIsAcceptRequest';
import RequestChangeButton from '@/widgets/TicketChange/ui/RequsetChangeButton';

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
    <div
      className="flex h-full w-full flex-col items-center justify-end bg-black/40"
      onClick={() => closeModal('ResponseModal')}
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
          <span className="font-bold text-blue">{seatIds.join(' • ')}</span>{' '}
          자리에서 변경 요청이 들어왔습니다. 자리를 변경하겠습니까?
        </p>

        <div className="mt-6 flex gap-3">
          <RequestChangeButton
            text="거절"
            bgColor="lightBlue"
            textColor="blue"
            onClick={async () => {
              closeModal('ResponseModal');
              await refuseRequest(response);
              await deleteRequsetAndResponse(response);
            }}
            className="flex-1 rounded-2xl py-3.5"
          />
          <RequestChangeButton
            text="수락"
            bgColor="blue"
            textColor="white"
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
            className="flex-[2] rounded-2xl py-3.5"
          />
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
