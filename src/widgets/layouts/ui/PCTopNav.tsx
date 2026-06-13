/**
 * @role: widgets — PC 상단 네비게이션
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { Link, useLocation } from 'react-router-dom';
import notification from '@/assets/icons/notification.png';
import on_user from '@/assets/icons/on_user.png';

interface PCTopNavProps {
  hasNotification: boolean;
}

const NAV_LINKS = [
  { label: '예약', path: '/' },
  { label: '내 승차권', path: '/ticketlist' },
  { label: '게시판', path: '/board' },
  { label: '마이페이지', path: '/mypage' },
];

const PCTopNav = ({ hasNotification }: PCTopNavProps) => {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 h-14 w-full border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between px-10">
        {/* 브랜드 */}
        <span className="text-2xl font-black tracking-tighter text-blue">
          JARINARE
        </span>

        {/* 네비게이션 링크 */}
        <ul className="flex items-center gap-8">
          {NAV_LINKS.map(({ label, path }) => {
            const isActive = pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-b-2 border-blue pb-1 text-blue'
                      : 'text-gray-500 hover:text-blue'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 아이콘 */}
        <div className="flex items-center gap-1">
          <Link
            to="/reserve/notification"
            className="relative rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <img width={20} height={24} src={notification} />
            {hasNotification && (
              <span className="absolute right-1.5 top-1.5 size-1.5 animate-ping rounded-full bg-blue" />
            )}
          </Link>
          <Link
            to="/mypage"
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <img width={24} height={24} src={on_user} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PCTopNav;
