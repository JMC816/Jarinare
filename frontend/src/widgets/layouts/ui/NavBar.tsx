/**
 * @role: widgets — 모바일 하단 네비게이션 바
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { Link, useLocation } from 'react-router-dom';
import useReserveModalStore from '@/widgets/model/ReserveStore';
import useNotifiModalStore from '@/widgets/model/Notification';
import { ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

/* 홈: 4분할 그리드 (PC 사이드바 동일) */
const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/* 게시판: 말풍선 (PC 사이드바 동일) */
const BoardIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);

/* 마이: 사람 실루엣 */
const UserIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

/* 메뉴: 햄버거 */
const MenuIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/* 로그인: 열쇠 */
const KeyIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke={active ? '#2563eb' : '#9ca3af'} strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="M21 2l-9.6 9.6" />
    <path d="M15.5 7.5l3 3L22 7l-3-3" />
  </svg>
);

const LOGGED_IN_ITEMS = [
  { text: '홈', path: '/', Icon: HomeIcon },
  { text: '게시판', path: '/board', Icon: BoardIcon },
  { text: '마이', path: '/mypage', Icon: UserIcon },
  { text: '메뉴', path: '/menu', Icon: MenuIcon },
];

const LOGGED_OUT_ITEMS = [
  { text: '홈', path: '/', Icon: HomeIcon },
  { text: '게시판', path: '/board', Icon: BoardIcon },
  { text: '로그인', path: '/auth/login', Icon: KeyIcon },
  { text: '메뉴', path: '/menu', Icon: MenuIcon },
];

const NavBar = () => {
  const { pathname } = useLocation();
  const isReserveShow = useReserveModalStore((state) => state.isShow);
  const isNotifiShow = useNotifiModalStore((state) => state.isShow);
  const isLoggedIn = !!localStorage.getItem(ACCESS_TOKEN_KEY);
  const items = isLoggedIn ? LOGGED_IN_ITEMS : LOGGED_OUT_ITEMS;

  return (
    <div
      className={`fixed lg:!hidden ${isReserveShow || isNotifiShow ? 'hidden' : ''} bottom-0 left-1/2 flex h-20 w-[376px] -translate-x-1/2 items-center justify-around rounded-t-3xl border-t border-lightGray bg-white shadow-lg`}
    >
      {items.map(({ text, path, Icon }) => {
        const isActive = pathname === path;
        return (
          <Link to={path} className="flex flex-col items-center gap-y-1" key={path}>
            <div className={`flex h-[40px] w-[40px] items-center justify-center rounded-full transition-all ${isActive ? 'bg-lightBlue' : ''}`}>
              <Icon active={isActive} />
            </div>
            <span className={`${isActive ? 'text-black' : 'text-mediumGray'} text-xs font-bold`}>
              {text}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default NavBar;
