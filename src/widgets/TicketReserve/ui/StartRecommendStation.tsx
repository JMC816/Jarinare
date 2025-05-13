import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import { PlaceModalProp } from '../types/ReserveType';

const StartRecommendStationList = ({ modalType }: PlaceModalProp) => {
  const { closeModal } = useModalStore();
  const { recommendStationArray } = reserveConstants();
  const { setStartStation, setStartStationForView } = trainDataStore();
  return (
    <div className="mt-[15px] w-full">
      <span className="text-base font-bold">추천역</span>
      <div className="grid grid-cols-5 gap-[5px]">
        {recommendStationArray.map(({ text, id }, idx) => (
          <div
            onClick={() => {
              closeModal(modalType!);
              setStartStation(id);
              setStartStationForView(text);
            }}
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

export default StartRecommendStationList;
