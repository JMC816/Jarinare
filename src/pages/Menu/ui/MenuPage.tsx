import { Link } from 'react-router-dom';
import { MenuArray } from '../constants/Menu';

const MenuPage = () => {
  return (
    <div className="flex w-full flex-col items-center">
      <span className="mt-5 w-full pl-[28px] pr-[27px] text-lg font-bold">
        메뉴
      </span>
      <div className="mt-[45px] flex w-full flex-col gap-y-[20px] px-[10px]">
        {MenuArray.map(({ text, link }, idx) => (
          <Link
            to={link!}
            className="flex gap-x-[10px] px-[17px] py-[9px] hover:rounded-md hover:bg-lightestGray"
            key={idx}
          >
            <div className="h-[30px] w-[30px] rounded-xs bg-black" />
            <span className="flex items-center text-base font-bold">
              {text}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
