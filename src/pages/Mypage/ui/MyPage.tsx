import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import useModalStore from '@/widgets/model/MyaPageStore';
import Modal from '@/widgets/MyPage/ui/Modal';
import UserInfo from '@/widgets/MyPage/ui/UserInfo';
import { useNaviation } from '../hooks/useNavigation';

const MyPage = () => {
  const { isShow, modalType } = useModalStore();
  const { point } = useGetPoint();
  const { navigate } = useNaviation();

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
        <span className="mt-5 w-full text-lg font-bold">마이페이지</span>
        <div className="mt-[40px] w-full">
          <UserInfo />
        </div>
      </div>
      <div className="mt-[30px] h-5 w-full bg-lightestGray" />
      <div className="flex w-full flex-col items-center pl-[28px] pr-[27px]">
        <span className="mt-5 w-full text-base text-darkGray underline">
          내 포인트
        </span>
        <div className="mt-5 flex w-full items-center justify-between gap-y-5">
          <span className="text-2xl font-semibold">
            {point.toLocaleString('ko-KR')} 원
          </span>
          <button
            onClick={() => navigate('/mypage/point')}
            className="h-[35px] w-[55px] rounded-xs bg-blue text-sm font-bold text-white active:brightness-50"
          >
            더보기
          </button>
        </div>
      </div>
      {isShow == false || modalType == undefined ? null : <Modal />}
    </div>
  );
};

export default MyPage;
