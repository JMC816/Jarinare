import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { reserveConstants } from '../constants/ReserveConstants';
import { formatDate, formatTime } from '@/shared/lib/formatDate';
import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';

const TimeChoiceModal = () => {
  const { closeModal } = useModalStore();
  const { timeArray } = reserveConstants();
  const { setStartTime, setStartTimeForView, startDay } = trainDataStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[40px] pr-[40px] md:mb-[50px]">
        <div className="flex w-full justify-between pt-[25px]">
          <span className="text-base font-bold">시간 선택</span>
          <div>
            <CrossModalButton
              closeModal={() => closeModal('TimeChoiceModal')}
            />
          </div>
        </div>
        <div className="mt-[30px] grid w-full grid-cols-4 items-center gap-[15px] text-tiny">
          {timeArray.map(({ timeView, time }, idx) => (
            <div
              key={idx}
              onClick={() => {
                closeModal('TimeChoiceModal');
                // 시간대 선택
                setStartTime(time);
                setStartTimeForView(timeView);
              }}
              className={`${startDay === formatDate(new Date()) && time <= formatTime() ? 'pointer-events-none brightness-50' : ''} flex h-[35px] w-[60px] cursor-pointer items-center justify-center rounded-md border border-lightGray bg-lightestGray text-tiny text-darkGray active:brightness-50`}
            >
              {timeView}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeChoiceModal;
