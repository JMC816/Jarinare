/**
 * @role: pages — PC 자유게시판 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { Board } from '@/widgets/Board/ui/Board';

const PCBoardListPage = () => {
  const navigate = useNavigate();

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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="mb-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  게시판
                </button>
                <h1 className="text-2xl font-black text-gray-900">
                  자유게시판
                </h1>
              </div>
              <button
                onClick={() => navigate('/board/board')}
                className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue/90"
              >
                글쓰기
              </button>
            </div>

            <div className="rounded-xl bg-white shadow-sm">
              <Board />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCBoardListPage;
