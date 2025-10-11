import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const PublicHomeLayout = () => {
  return (
    <>
      <Outlet />
      <NavBar />
    </>
  );
};

export default PublicHomeLayout;
