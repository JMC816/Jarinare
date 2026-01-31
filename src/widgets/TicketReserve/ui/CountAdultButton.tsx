import plus from '@/assets/icons/plus.png';
import minus from '@/assets/icons/minus.png';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

export const CountAdultButton = () => {
  const { setAdult, adult } = trainDataStore();
  return (
    <div className="flex h-[30px] w-[100px] items-center justify-between rounded-xs bg-lightestGray p-[3px]">
      <div
        onClick={() => (adult === 0 ? setAdult(0) : setAdult(adult - 1))}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
      >
        <img src={minus} width={10} />
      </div>
      <span>{adult < 0 ? 0 : adult}</span>
      <div
        onClick={() => setAdult(adult + 1)}
        className="flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-xs bg-lightGray shadow-sm transition-all hover:border-mediumGray hover:shadow-md active:brightness-95"
      >
        <img src={plus} width={10} />
      </div>
    </div>
  );
};
