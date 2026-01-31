import plus from '@/assets/icons/plus.png';
import minus from '@/assets/icons/minus.png';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const CountKidButton = () => {
  const { setKid, kid } = trainDataStore();
  return (
    <div className="flex h-[30px] w-[100px] items-center justify-between rounded-xs bg-lightestGray p-[3px]">
      <div
        onClick={() => (kid === 0 ? setKid(0) : setKid(kid - 1))}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
      >
        <img src={minus} width={10} />
      </div>
      <span>{kid < 0 ? 0 : kid}</span>
      <div
        onClick={() => setKid(kid + 1)}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
      >
        <img src={plus} width={10} />
      </div>
    </div>
  );
};
