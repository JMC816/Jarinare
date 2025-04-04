import MiniButton from '@/shared/ui/MiniButton';
import { ReserveWayArray } from '../constants/ReserveConstants';
import useModalStore from '@/widgets/model/ReserveStore';

const ReserveWay = () => {
  const { openModal } = useModalStore();
  return (
    <div className="flex h-[320px] w-[320px] flex-col items-center justify-center gap-y-5 rounded-lg bg-lightestGray pb-5 pt-5">
      {ReserveWayArray.map(
        ({ icon, text, attribute, buttonText, modalType }, idx) => (
          <div
            className="flex h-[55px] w-[280px] items-center rounded-lg bg-white pl-[10px]"
            key={idx}
          >
            <img width={20} height={20} src={icon} />
            <div className="flex w-[140px] flex-col pl-[10px] font-bold">
              <span className="text-base text-mediumGray">{text}</span>
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
