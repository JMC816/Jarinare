import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import MiniTicket from '@/widgets/TicketList/ui/MiniTicket';
import { useMiniTicket } from '@/widgets/TicketList/hooks/useMiniTicket';
import PCTicketListPage from './PCTicketListPage';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { usePCTicketListPage } from '../hooks/usePCTicketListPage';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const TicketListPage = () => {
  const { items, isEmpty } = useMiniTicket();
  const { isLoggedIn } = usePCTicketListPage();
  const navigate = useNavigate();

  const upcomingCount = items.filter((item) => {
    const now = new Date();
    const s = item.startTimeStr;
    const dep = new Date(
      Number(s.slice(0, 4)),
      Number(s.slice(4, 6)) - 1,
      Number(s.slice(6, 8)),
      Number(s.slice(8, 10)),
      Number(s.slice(10, 12)),
    );
    return dep > now;
  }).length;

  useEffect(() => {
    clearAllSeatsCache();
    prefetchAllSeats();
  }, []);

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCTicketListPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col items-center bg-gray-100 pl-[28px] pr-[27px] lg:hidden">
        <BackWardPageButton />
        <div className="mt-5 flex w-full items-baseline justify-between">
          <span className="text-lg font-bold">내 승차권</span>
          {!isEmpty && (
            <span className="text-sm text-gray-400">예정된 승차권 {upcomingCount}권</span>
          )}
        </div>
        {!isLoggedIn ? (
          <div className="mt-12">
            <LoginRequiredBlock
              description="로그인 후 내 승차권을 확인할 수 있어요"
              onLogin={() => navigate('/auth/login')}
              size="md"
            />
          </div>
        ) : (
          <div className="mt-5 flex w-full flex-col gap-y-5 pb-[100px]">
            <MiniTicket items={items} isEmpty={isEmpty} />
          </div>
        )}
      </div>
    </>
  );
};

export default TicketListPage;
