import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import ProtectedRoute from './ProtectedRoute';

const HomeLayout = () => {
  return (
    <ProtectedRoute>
      <Outlet />
      <NavBar />
    </ProtectedRoute>
  );
};

export default HomeLayout;
