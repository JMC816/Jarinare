import useModalStore from '../../model/ReserveStore';
import { TimeArray } from '../constants/Reserve';

const TimeChoiceModal = () => {
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[40px] pr-[40px]">
        <span className="w-full pt-[25px] text-base font-bold">시간 선택</span>
        <div className="mt-[30px] grid w-full grid-cols-4 items-center gap-[15px] text-tiny">
          {TimeArray.map(({ time }, idx) => (
            <div
              onClick={() => closeModal('TimeChoiceModal')}
              key={idx}
              className="flex h-[35px] w-[60px] cursor-pointer items-center justify-center rounded-md border border-lightGray bg-lightestGray text-tiny text-darkGray active:brightness-50"
            >
              {time}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeChoiceModal;
