/**
 * @role: pages — 메뉴 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { Link } from 'react-router-dom';
import { MenuConstants } from '../constants/MenuConstants';
import backward from '@/assets/icons/backward.png';
import { useBackButton } from '@/widgets/layouts/hooks/BackWardHook';

const MenuPage = () => {
  const { onClick: goBack } = useBackButton();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 px-[28px]">
      <div className="flex w-full items-center pt-[20px]">
        <div className="flex items-center gap-3">
          <img onClick={goBack} src={backward} className="h-[20px] w-[12px] cursor-pointer" />
          <span className="text-base font-bold">메뉴</span>
        </div>
      </div>
      <div className="mt-[20px] flex w-full flex-col gap-y-3">
        {MenuConstants().map(({ text, link, icon, subItems }, idx) => {
          if (subItems) {
            return (
              <div key={idx} className="flex flex-col gap-y-3">
                <div className="flex items-center gap-x-2 px-1">
                  <img width={18} height={18} src={icon} />
                  <span className="text-sm font-bold text-gray-500">
                    {text}
                  </span>
                </div>
                {subItems.map((sub) => (
                  <Link
                    key={sub.link}
                    to={sub.link}
                    className="flex items-center rounded-xl bg-white px-4 py-4 shadow-sm active:brightness-95"
                  >
                    <span className="text-base font-bold">{sub.text}</span>
                  </Link>
                ))}
              </div>
            );
          }
          return (
            <Link
              to={link!}
              className="flex items-center gap-x-3 rounded-xl bg-white px-4 py-4 shadow-sm active:brightness-95"
              key={idx}
            >
              <img width={22} height={22} src={icon} />
              <span className="text-base font-bold">{text}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MenuPage;
