import Button from '@/shared/ui/Button';
import useModalStore from '../../model/ReserveStore';
import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';
import { CountAdultButton } from './CountAdultButton';
import { CountKidButton } from './CountKidButton';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const CountModal = () => {
  const { closeModal } = useModalStore();
  const { kid, adult } = trainDataStore();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[350px] w-[345px] flex-col items-center rounded-2xl bg-white pl-[40px] pr-[40px] md:mb-[50px]">
        <div className="flex w-full justify-between pb-[20px] pt-[25px]">
          <span className="w-full text-base font-bold">인원선택</span>
          <div>
            <CrossModalButton closeModal={() => closeModal('CountModal')} />
          </div>
        </div>
        <div className="mt-[40px] flex w-full flex-col gap-y-[30px] text-tiny font-bold">
          <div className="flex items-center justify-between">
            <span>어른</span>
            <CountAdultButton />
          </div>
          <div className="flex items-center justify-between">
            <span>어린이</span>
            <CountKidButton />
          </div>
        </div>
        {kid <= 0 && adult <= 0 ? null : (
          <span className="mb-[20px] flex h-full w-full items-end text-tiny font-bold">
            어른&nbsp;
            <span className="text-blue">{adult < 0 ? 0 : adult}</span>명 •
            어린이&nbsp;
            <span className="text-blue">{kid < 0 ? 0 : kid}</span>명
          </span>
        )}
        <div
          className={`mb-[15px] ${kid <= 0 && adult <= 0 ? 'flex h-full items-end' : null}`}
        >
          <Button
            bgColor="blue"
            text="선택"
            textColor="white"
            onModalClick={() => closeModal('CountModal')}
          />
        </div>
      </div>
    </div>
  );
};

export default CountModal;
