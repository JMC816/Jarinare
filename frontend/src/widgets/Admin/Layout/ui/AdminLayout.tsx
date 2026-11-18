/**
 * @role: widgets — 어드민 공통 레이아웃 (헤더 + 사이드바)
 * @rule: 레이아웃 구조만 담당, 도메인 비즈니스 로직 포함 금지
 */
import { Link, useLocation } from 'react-router-dom';
import tapIcon from '@/assets/logo/tap.png';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useAdminLogout } from '@/features/Admin/Login/hooks/useAdminLogout';
import { useProfileDropdown } from '@/features/Admin/Login/hooks/useProfileDropdown';

const NAV_ITEMS: { label: string; path: string; permission: string }[] = [
  { label: '대시보드',    path: '/admin/dashboard',     permission: 'dashboard:read' },
  { label: '회원',        path: '/admin/users',          permission: 'user:read' },
  { label: '신고',        path: '/admin/reports',        permission: 'report:read' },
  { label: '예매·좌석',   path: '/admin/reservations',   permission: 'reservation:read' },
  { label: '게시판',      path: '/admin/board',          permission: 'board:manage' },
  { label: '멤버십',      path: '/admin/membership',     permission: 'membership:manage' },
  { label: '카드 할인',   path: '/admin/card-discount',  permission: 'discount:manage' },
  { label: '알림 발송',   path: '/admin/notifications',  permission: 'notification:send' },
  { label: '스케줄러',    path: '/admin/scheduler',      permission: 'scheduler:read' },
  { label: '감사 로그',   path: '/admin/audit',          permission: 'admin:manage' },
  { label: '역할·어드민', path: '/admin/roles',           permission: 'admin:manage' },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const { user } = useCurrentUser();
  const { logout } = useAdminLogout();
  const { profileOpen, toggle, close } = useProfileDropdown();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => (user?.permissions ?? []).includes(item.permission),
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">

      {/* 헤더 */}
      <header className="sticky top-0 z-50 h-14 w-full shrink-0 border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <img src={tapIcon} alt="" width={34} height={34} />
            <span className="text-base font-black text-gray-900">자리나래 관리자</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={toggle}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9ca3af">
                    <path d="M12 12c2.7 0 5-2.3 5-5S14.7 2 12 2 7 4.3 7 7s2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" />
                  </svg>
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-gray-800">{user?.name ?? '-'}</div>
                  <div className="text-[10px] text-gray-400">{user?.adminRole?.name ?? '-'}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={close} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    <button
                      onClick={() => { close(); logout(); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 사이드바 */}
        <aside className="flex h-full w-[220px] shrink-0 flex-col overflow-y-auto border-r border-gray-200/50 bg-white/60 px-3 py-6 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {visibleNavItems.map(({ label, path }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    active ? 'bg-lightBlue text-blue' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className={`h-4 w-4 shrink-0 ${active ? 'bg-blue' : 'bg-gray-200'}`} style={{ borderRadius: 3 }} />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 콘텐츠 */}
        <main className="flex-1 overflow-y-auto h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
