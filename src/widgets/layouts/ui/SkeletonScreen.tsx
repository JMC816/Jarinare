import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import {
  formatTodayDate,
  isToday,
} from '@/widgets/TicketReserve/lib/formatDate';

const SkeletonScreen = () => {
  const { trainTime } = trainQueryData();
  const { startDay } = trainDataStore();
  const today = isToday();
  const filtered = trainTime.filter((time) => {
    if (today === startDay) {
      return time.depplandtime >= formatTodayDate();
    }
    return true;
  });
  const arr = Array.from({ length: filtered.length }, (_, i) => i);
  return (
    <div className="mt-[40px] flex w-[320px] flex-col gap-y-[30px]">
      {arr.map((idx) => (
        <div
          key={idx}
          className="flex h-full w-full animate-pulse items-center justify-between"
        >
          <div className="flex h-[45px] flex-col justify-between">
            <span className="h-[21px] w-[192px] rounded-xs bg-gray-200" />
            <div className="flex h-[18px] justify-between">
              <span className="w-[130px] rounded-xs bg-gray-200" />
              <span className="w-[48px] rounded-xs bg-gray-200" />
            </div>
          </div>
          <div className="flex h-[30px] w-[50px] rounded-sm bg-gray-200" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonScreen;
