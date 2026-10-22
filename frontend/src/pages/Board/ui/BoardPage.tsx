/**
 * @role: pages — 모바일 게시판 허브 페이지
 * @rule: 렌더링·조합만 담당, 비즈니스 로직 포함 금지
 */
import backward from '@/assets/icons/backward.png';
import SeasonBanner from '@/widgets/Season/ui/SeasonBanner';
import { useNavigate } from 'react-router-dom';
import PCBoardPage from './PCBoardPage';

const BOARDS = [
  {
    key: 'notice' as const,
    label: '공지사항',
    path: '/board/noticelist',
  },
  {
    key: 'event' as const,
    label: '이벤트',
    path: '/board/eventlist',
  },
  {
    key: 'board' as const,
    label: '자유게시판',
    path: '/board/boardlist',
  },
];

const BoardPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardPage />
      </div>
      <div className="relative flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center gap-4 bg-gray-100 px-[28px] py-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">게시판</h1>
        </div>

        {/* 계절 할인 배너 */}
        <div className="px-4 py-2">
          <SeasonBanner />
        </div>

        {/* 게시판 목록 */}
        <div className="p-4">
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm">
            {BOARDS.map(({ key, label, path }) => (
              <button
                key={key}
                onClick={() => navigate(path)}
                className="flex w-full items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 text-left transition-colors active:bg-gray-200"
              >
                <span className="w-[72px] shrink-0 text-sm font-bold text-blue">
                  {label}
                </span>
                <div className="h-3 w-[1px] shrink-0 bg-gray-300" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-auto text-gray-300"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default BoardPage;
