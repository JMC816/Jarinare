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
    <div className="flex min-h-screen w-full flex-col bg-gray-50 px-[28px]">
      <div className="flex w-full items-center pt-[20px]">
        <div className="flex items-center gap-3">
          <img onClick={goBack} src={backward} className="h-[20px] w-[12px] cursor-pointer" />
          <span className="text-base font-bold">메뉴</span>
        </div>
      </div>
      <div className="mt-[20px] flex w-full flex-col">
        {MenuConstants().map(({ text, link, subItems }, idx) => {
          if (subItems) {
            return (
              <div key={idx} className="flex flex-col">
                {subItems.map((sub) => (
                  <Link
                    key={sub.link}
                    to={sub.link}
                    className="flex items-center border-b border-gray-100 py-4 active:opacity-60"
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
              className="flex items-center border-b border-gray-100 py-4 active:opacity-60"
              key={idx}
            >
              <span className="text-base font-bold">{text}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MenuPage;
