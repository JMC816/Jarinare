/**
 * @role: widgets — PC 사이드바 네비게이션
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { Link, useLocation } from 'react-router-dom';
import on_home from '@/assets/icons/on_home.png';
import off_home from '@/assets/icons/off_home.png';
import on_user from '@/assets/icons/on_user.png';
import off_user from '@/assets/icons/off_user.png';
import on_board from '@/assets/icons/on_board.png';
import off_board from '@/assets/icons/off_board.png';
import returned from '@/assets/icons/returned.png';
import setting from '@/assets/icons/setting.png';

const SIDEBAR_ITEMS = [
  { label: '대시보드', path: '/', onIcon: on_home, offIcon: off_home },
  { label: '내 승차권', path: '/ticketlist', onIcon: on_user, offIcon: off_user },
  { label: '게시판', path: '/board', onIcon: on_board, offIcon: off_board },
  { label: '승차권 반환', path: '/returnlist', onIcon: returned, offIcon: returned },
];

const PCSidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[220px] shrink-0 flex-col border-r border-gray-200/50 bg-white/60 px-3 py-6 backdrop-blur-xl lg:flex">
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map(({ label, path, onIcon, offIcon }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-lightBlue text-blue'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <img
                width={20}
                height={20}
                src={isActive ? onIcon : offIcon}
              />
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          );
        })}

        <div className="mt-auto pt-4">
          <Link
            to="/mypage"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 transition-colors hover:bg-gray-100"
          >
            <img width={20} height={20} src={setting} />
            <span className="text-sm font-semibold">설정</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default PCSidebar;
