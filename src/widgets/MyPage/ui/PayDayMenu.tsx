import down from '@/assets/icons/down.png';
import useModalStore from '@/shared/modals/model/MyaPageStore';

const PayDayMenu = () => {
  const { openModal } = useModalStore();
  return (
    <div
      onClick={() => openModal('DayModal')}
      className="mt-[25px] flex w-full justify-start"
    >
      <div className="shadow-black/4 flex h-[30px] w-[150px] cursor-pointer items-center justify-center gap-[6px] rounded-xs bg-white drop-shadow-[0_0_5px_rgba(0,0,0,0.25)] active:brightness-50">
        <span className="text-xs font-bold">2025년 2월 23일</span>
        <img src={down} width={11} height={7} />
      </div>
    </div>
  );
};

export default PayDayMenu;
