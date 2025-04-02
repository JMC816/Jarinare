import useModalStore from '../../model/ReserveStore';
import { RecommendStationArray } from '../constants/ReserveConstants';
import { PlaceModalProp } from '../types/ReserveType';

const RecommendStationList = ({ modalType }: PlaceModalProp) => {
  const { closeModal } = useModalStore();
  return (
    <div className="mt-[15px] w-full">
      <span className="text-base font-bold">추천역</span>
      <div className="grid grid-cols-5 gap-[5px]">
        {RecommendStationArray.map(({ text }, idx) => (
          <div
            onClick={() => closeModal(modalType!)}
            key={idx}
            className="flex h-[35px] w-[60px] cursor-pointer items-center justify-center rounded-md border border-lightGray bg-lightestGray text-tiny text-darkGray active:brightness-50"
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendStationList;
