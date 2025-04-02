import MiniButton from '@/shared/ui/MiniButton';
import { TrainListArray } from '../constants/ReserveConstants';

const TrainList = () => {
  return (
    <div className="mt-[40px] flex w-full flex-col gap-y-[30px] overflow-y-auto">
      {TrainListArray.map(
        ({ startTime, endTime, trainName, takeTime }, idx) => (
          <div key={idx} className="flex w-full items-center justify-between">
            <div>
              <span className="text-lg font-bold">
                {startTime} - {endTime}
              </span>
              <div className="flex justify-between text-tiny">
                <span className="font-bold text-blue">{trainName}</span>
                <span className="text-darkGray">{takeTime}</span>
              </div>
            </div>
            <MiniButton text="선택" modalTypes={'ChoiceResultModal'} />
          </div>
        ),
      )}
    </div>
  );
};

export default TrainList;
