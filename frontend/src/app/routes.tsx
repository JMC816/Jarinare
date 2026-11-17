import AdminAccessDeniedPage from '@/pages/Admin/AccessDenied/ui/AdminAccessDeniedPage';
import AdminAuditPage from '@/pages/Admin/Audit/ui/AdminAuditPage';
import AdminBoardPage from '@/pages/Admin/Board/ui/AdminBoardPage';
import AdminCardDiscountPage from '@/pages/Admin/CardDiscount/ui/AdminCardDiscountPage';
import AdminDashboardPage from '@/pages/Admin/Dashboard/ui/AdminDashboardPage';
import AdminLoginPage from '@/pages/Admin/Login/ui/AdminLoginPage';
import AdminMembershipPage from '@/pages/Admin/Membership/ui/AdminMembershipPage';
import AdminNotificationsPage from '@/pages/Admin/Notifications/ui/AdminNotificationsPage';
import AdminReportsPage from '@/pages/Admin/Reports/ui/AdminReportsPage';
import AdminReservationsPage from '@/pages/Admin/Reservations/ui/AdminReservationsPage';
import AdminRolesPage from '@/pages/Admin/Roles/ui/AdminRolesPage';
import AdminSchedulerPage from '@/pages/Admin/Scheduler/ui/AdminSchedulerPage';
import AdminUsersPage from '@/pages/Admin/Users/ui/AdminUsersPage';
import AdminGuard from '@/widgets/Admin/Guard/ui/AdminGuard';
import GithubRedirect from '@/features/Auth/SocialLogin/ui/GithubRedirect';
import GoogleRedirect from '@/features/Auth/SocialLogin/ui/GoogleRedirect';
import KakaoRedirect from '@/features/Auth/SocialLogin/ui/KakaoRedirect';
import LoginPage from '@/pages/Auth/Login/ui/LoginPage';
import SignUpPage from '@/pages/Auth/SignUp/ui/SignUpPage';
import BoardPage from '@/pages/Board/ui/BoardPage';
import BoardDetailPage from '@/pages/Board/ui/BoardDetailPage';
import BoardByIdPage from '@/pages/Board/ui/BoardByIdPage';
import BoardListPage from '@/pages/Board/ui/BoardListPage';
import BoardWirtePage from '@/pages/Board/ui/BoardWritePage';
import PCUnifiedWritePage from '@/pages/Board/ui/PCUnifiedWritePage';
import EventDetailPage from '@/pages/Board/ui/EventDetailPage';
import EventListPage from '@/pages/Board/ui/EventListPage';
import EventWirtePage from '@/pages/Board/ui/EventWritePage';
import PCNoticeDetailPage from '@/pages/Board/ui/PCNoticeDetailPage';
import FavoriteListPage from '@/pages/Board/ui/FavoriteListPage';
import PCTravelReviewPage from '@/pages/TravelReview/ui/PCTravelReviewPage';
import PCTravelReviewListPage from '@/pages/TravelReview/ui/PCTravelReviewListPage';
import NoticeListPage from '@/pages/Board/ui/NoticeListPage';
import NoticeWirtePage from '@/pages/Board/ui/NoticeWritePage';
import MenuPage from '@/pages/Menu/ui/MenuPage';
import MyPage from '@/pages/Mypage/ui/MyPage';
import NotificationPage from '@/pages/Notification/ui/NotificationPage';
import SeatChangePage from '@/pages/TicketChange/ui/SeatChangePage';
import TicketSeatChangePage from '@/pages/TicketChange/ui/TicketSeatChangePage';
import TicketViewPage from '@/pages/TicketChange/ui/TicketViewPage';
import TicketListPage from '@/pages/TicketList/ui/TicketListPage';
import HomePage from '@/pages/TicketReserve/ui/HomePage';
import SeatCheckPage from '@/pages/TicketReserve/ui/SeatCheckPage';
import TrainCheckPage from '@/pages/TicketReserve/ui/TrainCheckPage';
import SeatReturnPage from '@/pages/TicketReturn/ui/SeatReturnPage';
import TicketReturnPage from '@/pages/TicketReturn/ui/TicketReturnPage';
import SettingPage from '@/pages/Set/ui/SettingPage';
import HistoryPage from '@/pages/History/ui/HistoryPage';
import Modal from '@/shared/ui/Modal';
import PCNotificationSidebar from '@/widgets/Notification/ui/PCNotificationSidebar';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import MainLayout from '@/widgets/layouts/ui/MainLayout';
import PublicHomeLayout from '@/widgets/layouts/ui/PublicHomeLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useModalRouteReset } from './hooks/useModalRouteReset';

const ModalRouteReset = () => {
  useModalRouteReset();

  return null;
};

const Router = () => {
  return (
    <BrowserRouter>
      <ModalRouteReset />
      <div className="relative w-full">
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/access-denied" element={<AdminAccessDeniedPage />} />
          <Route path="/admin/dashboard" element={<AdminGuard permission="dashboard:read"><AdminDashboardPage /></AdminGuard>} />
          <Route path="/admin/users" element={<AdminGuard permission="user:read"><AdminUsersPage /></AdminGuard>} />
          <Route path="/admin/reports" element={<AdminGuard permission="report:read"><AdminReportsPage /></AdminGuard>} />
          <Route path="/admin/reservations" element={<AdminGuard permission="reservation:read"><AdminReservationsPage /></AdminGuard>} />
          <Route path="/admin/board" element={<AdminGuard permission="board:manage"><AdminBoardPage /></AdminGuard>} />
          <Route path="/admin/membership" element={<AdminGuard permission="membership:manage"><AdminMembershipPage /></AdminGuard>} />
          <Route path="/admin/card-discount" element={<AdminGuard permission="discount:manage"><AdminCardDiscountPage /></AdminGuard>} />
          <Route path="/admin/notifications" element={<AdminGuard permission="notification:send"><AdminNotificationsPage /></AdminGuard>} />
          <Route path="/admin/scheduler" element={<AdminGuard permission="scheduler:read"><AdminSchedulerPage /></AdminGuard>} />
          <Route path="/admin/audit" element={<AdminGuard permission="admin:manage"><AdminAuditPage /></AdminGuard>} />
          <Route path="/admin/roles" element={<AdminGuard permission="admin:manage"><AdminRolesPage /></AdminGuard>} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/oauth/kakao/callback" element={<KakaoRedirect />} />
          <Route path="/oauth/google/callback" element={<GoogleRedirect />} />
          <Route path="/oauth/github/callback" element={<GithubRedirect />} />
          {/* 로그인 불필요하 페이지들 */}
          <Route element={<PublicHomeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/board/noticelist" element={<NoticeListPage />} />
            <Route path="/board/eventlist" element={<EventListPage />} />
            <Route path="/board/boardlist" element={<BoardListPage />} />
            <Route path="/board/notice/detail" element={<PCNoticeDetailPage />} />
            <Route path="/board/event/detail" element={<EventDetailPage />} />
            <Route path="/board/board/detail" element={<BoardDetailPage />} />
            <Route path="/board/:id" element={<BoardByIdPage />} />
            <Route path="/travel/review/list" element={<PCTravelReviewListPage />} />
            <Route path="/board/favorites" element={<FavoriteListPage />} />
            <Route path="/travel/review" element={<PCTravelReviewPage />} />
            <Route path="/ticketlist" element={<TicketListPage />} />
            <Route path="/reserve/traincheck" element={<TrainCheckPage />} />
            <Route path="/reserve/seatcheck" element={<SeatCheckPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/returnlist" element={<TicketReturnPage />} />
            <Route path="/setting" element={<SettingPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          {/* 로그인 필수 페이지들 */}
          <Route element={<HomeLayout />}>
            <Route
              path="/reserve/notification"
              element={<NotificationPage />}
            />
            <Route path="/board/notice" element={<NoticeWirtePage />} />
            <Route path="/board/event" element={<EventWirtePage />} />
            <Route path="/board/board" element={<BoardWirtePage />} />
            <Route path="/board/write" element={<PCUnifiedWritePage />} />
          </Route>
          <Route path="/ticket/view" element={<TicketViewPage />} />
          <Route element={<MainLayout />}>
            <Route
              path="/ticket/seatchange"
              element={<TicketSeatChangePage />}
            />
            <Route path="/seatchange" element={<SeatChangePage />} />
            <Route path="/return" element={<SeatReturnPage />} />
          </Route>
        </Routes>
        <Modal />
        <PCNotificationSidebar />
      </div>
    </BrowserRouter>
  );
};

export default Router;
