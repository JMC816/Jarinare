import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import { PlaceModalProp } from '../types/ReserveType';

const EndRecommendStationList = ({ modalType }: PlaceModalProp) => {
  const { closeModal } = useModalStore();
  const { recommendStationArray } = reserveConstants();
  const { setEndStation, setEndStationForView } = trainDataStore();
  return (
    <div className="mt-[15px] w-full">
      <span className="text-base font-bold">추천역</span>
      <div className="grid grid-cols-5 gap-[5px]">
        {recommendStationArray.map(({ text, id }, idx) => (
          <div
            onClick={() => {
              closeModal(modalType!);
              setEndStation(id);
              setEndStationForView(text);
            }}
            key={idx}
            className="flex h-[35px] w-[60px] cursor-pointer items-center justify-center rounded-md border border-lightGray bg-lightestGray text-tiny text-darkGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EndRecommendStationList;
