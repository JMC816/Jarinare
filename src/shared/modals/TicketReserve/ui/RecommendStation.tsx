import { RecommendStationArray } from '../constants/Reserve';

const RecommendStationList = () => {
  return (
    <div className="mt-[15px] w-full">
      <span className="text-base font-bold">추천역</span>
      <div className="grid grid-cols-5 gap-[5px]">
        {RecommendStationArray.map(({ text }, idx) => (
          <div
            key={idx}
            className="flex h-[35px] w-[60px] items-center justify-center rounded-md border border-lightGray bg-lightestGray text-tiny text-darkGray"
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendStationList;
