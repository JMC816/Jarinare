import Button from '@/shared/ui/Button';
import useModalStore from '../../model/ReserveStore';
import { CountButton } from './CountButton';
import { useDayCount } from '../hooks/ReserveHook';
import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';

const CountModal = () => {
  const { closeModal } = useModalStore();
  const { countKid, countAdult, setCountKid, setCountAdult } = useDayCount();
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
            <CountButton count={countAdult} setCount={setCountAdult} />
          </div>
          <div className="flex items-center justify-between">
            <span>어린이</span>
            <CountButton count={countKid} setCount={setCountKid} />
          </div>
        </div>
        {countKid <= 0 && countAdult <= 0 ? null : (
          <span className="mb-[20px] flex h-full w-full items-end text-tiny font-bold">
            어른&nbsp;
            <span className="text-blue">{countAdult < 0 ? 0 : countAdult}</span>
            명 • 어린이&nbsp;
            <span className="text-blue">{countKid < 0 ? 0 : countKid}</span>명
          </span>
        )}
        <div
          className={`mb-[15px] ${countKid <= 0 && countAdult <= 0 ? 'flex h-full items-end' : null}`}
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
