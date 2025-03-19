import { Link } from 'react-router-dom';
import { NavBarArray } from '../constants/NavBar';
import { usePathName } from '../hooks/NavBar';

const NavBar = () => {
  const { location } = usePathName();
  return (
    <div className="fixed bottom-0 flex h-20 w-[375px] items-center justify-around border-t-[1px] border-lightGray bg-white">
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
