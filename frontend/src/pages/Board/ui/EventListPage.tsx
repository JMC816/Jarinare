/**
 * @role: pages — 이벤트 목록 페이지 (PC + 모바일)
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import { Event } from '@/widgets/Board/ui/Event';
import { useNavigate } from 'react-router-dom';
import WriteButton from '@/shared/ui/WriteButton';
import PCEventListPage from './PCEventListPage';
import { useHasPermission } from '@/features/Auth/hooks/useHasPermission';

const EventListPage = () => {
  const navigate = useNavigate();
  const isAdmin = useHasPermission('board:create');

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCEventListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center px-[28px] pt-[20px]">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-base font-bold">이벤트</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[80px]">
          <Event />
        </div>

        {isAdmin && <WriteButton onClick={() => navigate('/board/event')} />}
      </div>
    </>
  );
};

export default EventListPage;
