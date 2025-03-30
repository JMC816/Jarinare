import useModalStore from '../../model/TicketChangeStore';
import { TrainNumberArray } from '../constants/TicketChange';

const TrainNumberChoiceModal = () => {
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[40px] pr-[40px] font-bold">
        <span className="w-full pt-[25px] text-base">기차 선택</span>
        <div className="mt-[30px] flex w-full flex-col items-center gap-y-[20px] text-tiny">
          {TrainNumberArray.map(({ trainNumber, icon }, idx) => (
            <div
              onClick={() => closeModal('TrainNumberChoiceModal')}
              key={idx}
              className="group flex h-12 w-[300px] cursor-pointer items-center justify-between p-[20px] hover:rounded-md hover:bg-lightestGray"
            >
              <span>{trainNumber}</span>
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
