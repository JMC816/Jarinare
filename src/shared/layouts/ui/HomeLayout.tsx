import NavBar from '@/shared/ui/NavBar';
import { Outlet } from 'react-router-dom';

const HomeLayout = () => {
  return (
    <>
      <Outlet />
      <NavBar />
    </>
  );
};

export default HomeLayout;
