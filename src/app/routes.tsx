import KakaoRedirect from '@/features/Auth/SocialLogin/ui/KakaoRedirect';
import LoginPage from '@/pages/Auth/Login/ui/LoginPage';
import SignUpPage from '@/pages/Auth/SignUp/ui/SignUpPage';
import BoardPage from '@/pages/Board/ui/BoardPage';
import BoardWirtePage from '@/pages/Board/ui/BoardWritePage';
import EventWirtePage from '@/pages/Board/ui/EventWritePage';
import NoticeWirtePage from '@/pages/Board/ui/NoticeWritePage';
import MenuPage from '@/pages/Menu/ui/MenuPage';
import MyPage from '@/pages/Mypage/ui/MyPage';
import NotificationPage from '@/pages/Notification/ui/NotificationPage';
import { NotifiSettingPage } from '@/pages/Notification/ui/NotifiSettingPage';
import PointPage from '@/pages/Point/ui/PointPage';
import SeatChangePage from '@/pages/TicketChange/ui/SeatChangePage';
import TicketSeatChangePage from '@/pages/TicketChange/ui/TicketSeatChangePage';
import TicketListPage from '@/pages/TicketList/ui/TicketListPage';
import HomePage from '@/pages/TicketReserve/ui/HomePage';
import SeatCheckPage from '@/pages/TicketReserve/ui/SeatCheckPage';
import TrainCheckPage from '@/pages/TicketReserve/ui/TrainCheckPage';
import SeatReturnPage from '@/pages/TicketReturn/ui/SeatReturnPage';
import TicketReturnPage from '@/pages/TicketReturn/ui/TicketReturnPage';
import Modal from '@/shared/ui/Modal';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import MainLayout from '@/widgets/layouts/ui/MainLayout';
import PublicHomeLayout from '@/widgets/layouts/ui/PublicHomeLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Router = () => {
  return (
    <BrowserRouter>
      <div className="relative flex h-screen w-full justify-center">
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/oauth/kakao/callback" element={<KakaoRedirect />} />
          {/* 로그인 불필요하 페이지들 */}
          <Route element={<PublicHomeLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/board" element={<BoardPage />} />{' '}
          </Route>
          {/* 로그인 필수 페이지들 */}
          <Route element={<HomeLayout />}>
            <Route path="/board/notice" element={<NoticeWirtePage />} />
            <Route path="/board/event" element={<EventWirtePage />} />
            <Route path="/board/board" element={<BoardWirtePage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/point" element={<PointPage />} />
            <Route path="/returnlist" element={<TicketReturnPage />} />
            <Route path="/ticketlist" element={<TicketListPage />} />
            <Route
              path="/reserve/notification"
              element={<NotificationPage />}
            />
            <Route
              path="/reserve/notification/setting"
              element={<NotifiSettingPage />}
            />
            <Route path="/reserve/traincheck" element={<TrainCheckPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route path="/reserve/seatcheck" element={<SeatCheckPage />} />
            <Route
              path="/ticket/seatchange"
              element={<TicketSeatChangePage />}
            />
            <Route path="/seatchange" element={<SeatChangePage />} />
            <Route path="/return" element={<SeatReturnPage />} />
          </Route>
        </Routes>
        <Modal />
      </div>
    </BrowserRouter>
  );
};

export default Router;
