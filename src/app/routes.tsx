import KakaoRedirect from '@/features/Auth/SocialLogin/ui/KakaoRedirect';
import LoginPage from '@/pages/Auth/Login/ui/LoginPage';
import SignUpPage from '@/pages/Auth/SignUp/ui/SignUpPage';
import MenuPage from '@/pages/Menu/ui/MenuPage';
import MyPage from '@/pages/Mypage/ui/MyPage';
import NotificationPage from '@/pages/Notification/ui/NotificationPage';
import PontPage from '@/pages/Point/ui/PointPage';
import SeatChangePage from '@/pages/TicketChange/ui/SeatChangePage';
import TicketSeatChangePage from '@/pages/TicketChange/ui/TicketSeatChangePage';
import TickListPage from '@/pages/TicketList/ui/TicketListPage';
import TicketPaymentPage from '@/pages/TicketPayment/ui/TicketPaymentPage';
import HomePage from '@/pages/TicketReserve/ui/HomePage';
import SeatCheckPage from '@/pages/TicketReserve/ui/SeatCheckPage';
import TrainCheckPage from '@/pages/TicketReserve/ui/TrainCheckPage';
import SeatReturnePage from '@/pages/TicketReturn/ui/SeatReturnPage';
import TicketReturnPage from '@/pages/TicketReturn/ui/TicketReturnPage';
import HomeLayout from '@/widgets/layouts/ui/HomeLayout';
import MainLayout from '@/widgets/layouts/ui/MainLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/oauth/kakao/callback" element={<KakaoRedirect />} />
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/reserve/seatcheck" element={<SeatCheckPage />} />
          <Route path="/reserve/traincheck" element={<TrainCheckPage />} />
          <Route path="/reserve/notification" element={<NotificationPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/point" element={<PontPage />} />
          <Route path="/ticket/seatchange" element={<TicketSeatChangePage />} />
          <Route path="/ticket/payment" element={<TicketPaymentPage />} />
          <Route path="/returnlist" element={<TicketReturnPage />} />
          <Route path="/seatchange" element={<SeatChangePage />} />
          <Route path="/ticketlist" element={<TickListPage />} />
          <Route path="/return" element={<SeatReturnePage />} />
          <Route path="/notification" element={<NotificationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
