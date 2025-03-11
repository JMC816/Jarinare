import LoginPage from '@/pages/Auth/Login/ui/LoginPage';
import SignUpPage from '@/pages/Auth/SignUp/ui/SignUpPage';
import MenuPage from '@/pages/Menu/ui/MenuPage';
import MyPage from '@/pages/Mypage/ui/MyPage';
import SeatChangePage from '@/pages/TicketChange/ui/SeatChangePage';
import TickListPage from '@/pages/TicketList/ui/TicketListPage';
import TicketPaymentPage from '@/pages/TicketPayment/ui/TicketPaymentPage';
import HomePage from '@/pages/TicketReserve/ui/HomePage';
import NotificationPage from '@/pages/TicketReserve/ui/NotificationPage';
import SeatCheckPage from '@/pages/TicketReserve/ui/SeatCheckPage';
import TrainCheckPage from '@/pages/TicketReserve/ui/TrainCheckPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reserve/seatcheck" element={<SeatCheckPage />} />
        <Route path="/reserve/traincheck" element={<TrainCheckPage />} />
        <Route path="/reserve/notification" element={<NotificationPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/ticketchage" element={<SeatChangePage />} />
        <Route path="/ticketlist" element={<TickListPage />} />
        <Route path="/ticketpayment" element={<TicketPaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
