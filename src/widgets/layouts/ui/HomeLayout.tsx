import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const HomeLayout = () => {
  return (
    <>
      <Outlet />
      <NavBar />
    </>
  );
};

export default HomeLayout;
