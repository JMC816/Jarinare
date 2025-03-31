import LoginPage from '@/pages/Auth/Login/ui/LoginPage';
import SignUpPage from '@/pages/Auth/SignUp/ui/SignUpPage';
import MenuPage from '@/pages/Menu/ui/MenuPage';
import MyPage from '@/pages/Mypage/ui/MyPage';
import SeatChangePage from '@/pages/TicketChange/ui/SeatChangePage';
import TicketSeatChangePage from '@/pages/TicketChange/ui/TicketSeatChangePage';
import TickListPage from '@/pages/TicketList/ui/TicketListPage';
import TicketPaymentPage from '@/pages/TicketPayment/ui/TicketPaymentPage';
import HomePage from '@/pages/TicketReserve/ui/HomePage';
import NotificationPage from '@/pages/TicketReserve/ui/NotificationPage';
import SeatCheckPage from '@/pages/TicketReserve/ui/SeatCheckPage';
import TrainCheckPage from '@/pages/TicketReserve/ui/TrainCheckPage';
import TicketReturnPage from '@/pages/TicketReturn/ui/TicketReturnPage';
import HomeLayout from '@/shared/layouts/ui/HomeLayout';
import MainLayout from '@/shared/layouts/ui/MainLayout';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/reserve/seatcheck" element={<SeatCheckPage />} />
          <Route path="/reserve/traincheck" element={<TrainCheckPage />} />
          <Route path="/reserve/notification" element={<NotificationPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignUpPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/ticket/seatchange" element={<TicketSeatChangePage />} />
          <Route path="/ticket/payment" element={<TicketPaymentPage />} />
          <Route path="/ticket/return" element={<TicketReturnPage />} />
          <Route path="/seatchange" element={<SeatChangePage />} />
          <Route path="/ticketlist" element={<TickListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
