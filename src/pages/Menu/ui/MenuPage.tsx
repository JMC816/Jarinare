import { Link } from 'react-router-dom';
import { MenuConstants } from '../constants/MenuConstants';

const MenuPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 px-[28px]">
      <span className="mt-[60px] w-full text-lg font-bold">
        메뉴
      </span>
      <div className="mt-[20px] flex w-full flex-col gap-y-3">
        {MenuConstants().map(({ text, link, icon }, idx) => (
          <Link
            to={link!}
            className="flex items-center gap-x-3 rounded-xl bg-white px-4 py-4 shadow-sm active:brightness-95"
            key={idx}
          >
            <img width={22} height={22} src={icon} />
            <span className="text-base font-bold">{text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
