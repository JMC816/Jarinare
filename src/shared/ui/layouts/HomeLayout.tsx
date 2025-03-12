import { Outlet } from 'react-router-dom';
import Header from '../Header';
import NavBar from '../NavBar';

const HomeLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <NavBar />
    </>
  );
};

export default HomeLayout;
