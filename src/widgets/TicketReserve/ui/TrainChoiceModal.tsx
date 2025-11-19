import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';

const TrainChoiceModal = () => {
  const { closeModal } = useModalStore();
  const { trainArray } = reserveConstants();
  const { setTrainType, setTrainTypeForView, trainType } = trainDataStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white font-bold md:mb-[50px]">
        <span className="w-full pl-[40px] pr-[40px] pt-[25px] text-base">
          기차 선택
        </span>
        <div className="mb-[20px] mt-[30px] flex w-full flex-col items-center gap-y-[20px] overflow-y-auto text-tiny">
          {trainArray.map(({ train, icon, id }, idx) => (
            <div
              key={idx}
              onClick={async () => {
                await setTrainType(id);
                setTrainTypeForView(train);
                closeModal('TrainChoiceModal');
              }}
              className="group flex h-12 w-[300px] cursor-pointer items-center justify-between p-[20px] hover:rounded-md hover:bg-lightestGray"
            >
              <span>{train}</span>
              {trainType === id ? (
                <img src={icon} width={15} height={11} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainChoiceModal;
