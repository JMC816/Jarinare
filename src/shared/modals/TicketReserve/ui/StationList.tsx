import { StationListArray } from '../constants/Reserve';

const StationList = () => {
  return (
    <div className="w-full overflow-y-scroll pl-[28px] pr-[27px]">
      {StationListArray.map(({ text }, idx) => (
        <div
          key={idx}
          className="flex h-[50px] items-center text-base font-bold text-darkGray"
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default StationList;
