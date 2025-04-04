import MiniTicket from '@/shared/ui/MiniTicket';
import useModalStore from '@/widgets/model/MyaPageStore';
import Modal from '@/widgets/MyPage/ui/Modal';
import PayDayMenu from '@/widgets/MyPage/ui/PayDayMenu';
import UserInfo from '@/widgets/MyPage/ui/UserInfo';

const MyPage = () => {
  const { isShow, modalType } = useModalStore();
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
        <span className="mt-5 w-full text-lg font-bold">마이페이지</span>
        <div className="mt-[40px] w-full">
          <UserInfo name="000" userNumber={20251234} />
        </div>
      </div>
      <div className="mt-[30px] h-5 w-full bg-lightestGray" />
      <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
        <span className="mt-5 w-full text-base font-bold">
          승차권 구매 이력
        </span>
        <PayDayMenu />
        <div className="mt-5 flex flex-col gap-y-5">
          <MiniTicket
            startDay="출발 2월 23일 (일)"
            startStation="서울"
            startTime="오후 8시 32분"
            endStation="대전"
            endTime="오후 11시 32분"
            trainName="KTX 산천 201"
          />
        </div>
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default MyPage;
