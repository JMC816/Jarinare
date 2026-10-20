/**
 * @role: widgets — PC 상단 네비게이션
 * @rule: 렌더링만 담당, 비즈니스 로직 포함 금지
 */
import { Link } from 'react-router-dom';
import notification from '@/assets/icons/notification.png';
import on_user from '@/assets/icons/on_user.png';
import useNotificationSidebarStore from '@/widgets/Notification/model/notificationSidebarStore';
import { useBackendNotifications } from '@/features/Notification/hooks/useBackendNotifications';

const PCTopNav = () => {
  const openNotificationSidebar = useNotificationSidebarStore(
    (state) => state.open,
  );
  const { notifications } = useBackendNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="sticky top-0 z-50 h-14 w-full border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between px-10">
        {/* 브랜드 */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-blue">
          JARINARE
        </Link>

        {/* 아이콘 */}
        <div className="flex items-center gap-1">
          <button
            onClick={openNotificationSidebar}
            className={`relative rounded-lg p-2 transition-colors hover:bg-gray-100 ${unreadCount > 0 ? 'animate-bounce' : ''}`}
          >
            <img width={20} height={24} src={notification} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
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
