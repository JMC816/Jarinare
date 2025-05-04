import MiniButton from '@/shared/ui/MiniButton';
import { reserveConstants } from '../constants/ReserveConstants';
import useModalStore from '@/widgets/model/ReserveStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const ReserveWay = () => {
  const { openModal } = useModalStore();
  const { reserveWayArray } = reserveConstants();
  const { startStation, endStation, startDay, kid, adult } = trainDataStore();
  return (
    <div className="flex h-[320px] w-[320px] flex-col items-center justify-center gap-y-5 rounded-lg bg-lightestGray pb-5 pt-5">
      {reserveWayArray.map(
        ({ icon, text, attribute, buttonText, modalType }, idx) => (
          <div
            className="flex h-[55px] w-[280px] items-center rounded-lg bg-white pl-[10px]"
            key={idx}
          >
            <img width={20} height={20} src={icon} />
            <div className="flex w-[140px] flex-col pl-[10px] font-bold">
              <span
                className={`text-base ${text === startStation || text === endStation || text === startDay || text.includes(`${kid + adult}명`) ? 'text-black' : 'text-mediumGray'}`}
              >
                {text}
              </span>
              <span className="text-tiny text-mediumGray">{attribute}</span>
            </div>
            <div className="pl-[50px]">
              <MiniButton
                text={buttonText}
                onModalClick={() => openModal(modalType)}
              />
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default ReserveWay;
