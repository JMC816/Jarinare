import { Link } from 'react-router-dom';
import { usePathName } from '../hooks/NavBarHook';
import { NavBarConstants } from '../constants/NavBarConstants';
import useReserveModalStore from '@/widgets/model/ReserveStore';
import useNotifiModalStore from '@/widgets/model/Notification';

const NavBar = () => {
  const { location } = usePathName();
  const isReserveShow = useReserveModalStore((state) => state.isShow);
  const isNotifiShow = useNotifiModalStore((state) => state.isShow);

  return (
    <div
      className={`fixed ${isReserveShow || isNotifiShow === true ? 'hidden' : null} bottom-0 flex h-20 w-full items-center justify-around border-t-[1px] border-lightGray bg-white`}
    >
      {NavBarConstants().map(({ on_icon, off_icon, text, path }, idx) => (
        <Link to={path} className="flex flex-col items-center" key={idx}>
          <img
            width={24}
            height={24}
            src={location.pathname === path ? on_icon : off_icon}
          />
          <span
            className={`${location.pathname === path ? 'text-black' : 'text-mediumGray'} font-bold`}
          >
            {text}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default NavBar;
