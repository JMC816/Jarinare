import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';

const TrainNumberChoiceModal = () => {
  const { closeModal } = useModalStore();
  const { trainNoArray } = reserveConstants();
  const { setTrainNo } = trainDataStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[40px] pr-[40px] font-bold md:mb-[50px]">
        <div className="flex w-full justify-between pb-[20px] pt-[25px]">
          <span className="w-full text-base">기차 선택</span>
          <div>
            <CrossModalButton
              closeModal={() => closeModal('TrainNumberChoiceModal')}
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-y-[20px] text-tiny">
          {trainNoArray.map(({ trainNoView, trainNo, icon }, idx) => (
            <div
              onClick={() => {
                setTrainNo(trainNo);
                closeModal('TrainNumberChoiceModal');
              }}
              key={idx}
              className="group flex h-12 w-[300px] cursor-pointer items-center justify-between p-[20px] hover:rounded-md hover:bg-lightestGray"
            >
              <span>
                {trainNo}호차 잔여&nbsp;
                <span className="text-blue">{trainNoView}</span>석/24석
              </span>
              <img
                className="hidden group-active:flex"
                src={icon}
                width={15}
                height={11}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainNumberChoiceModal;
