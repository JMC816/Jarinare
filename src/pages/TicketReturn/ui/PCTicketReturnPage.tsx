/**
 * @role: pages — PC 승차권 반환 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import MiniTicket from '@/widgets/TicketReturn/ui/MiniTicket';
import Modal from '@/widgets/TicketReturn/ui/Modal';
import { usePCTicketReturnPage } from '../hooks/usePCTicketReturnPage';

const PCTicketReturnPage = () => {
  const { handleReturnPC, isShow, modalType } = usePCTicketReturnPage();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav hasNotification={false} />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="px-64 pb-16 pt-10">
            {/* 파란 배경 제목 카드 */}
            <div className="mb-6 overflow-hidden rounded-2xl bg-blue px-8 py-10 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-white">승차권 반환</h1>
                <p className="text-sm text-white/70">
                  예매한 승차권을 확인하고 반환할 수 있어요
                </p>
              </div>
            </div>

            {/* 승차권 목록 */}
            <div className="flex flex-col gap-4">
              <MiniTicket onReturnPC={handleReturnPC} />
            </div>
          </div>
        </main>
      </div>

      {isShow && modalType === 'ReturnModal' && <Modal />}
    </div>
  );
};

export default PCTicketReturnPage;
