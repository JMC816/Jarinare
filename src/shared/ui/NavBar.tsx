import { Link } from 'react-router-dom';
import useModalStore from '../modals/model/ReserveStore';
import { usePathName } from '../hooks/NavBarHook';
import { NavBarArray } from '../constants/NavBarConstants';

const NavBar = () => {
  const { location } = usePathName();
  const { isShow } = useModalStore();
  return (
    <div
      className={`fixed ${isShow === true ? 'hidden' : null} bottom-0 flex h-20 w-[375px] items-center justify-around border-t-[1px] border-lightGray bg-white`}
    >
      {NavBarArray.map(({ on_icon, off_icon, text, path }, idx) => (
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
