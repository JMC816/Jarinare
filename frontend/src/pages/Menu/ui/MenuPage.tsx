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
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img onClick={goBack} src={backward} className="h-[20px] w-[12px] cursor-pointer" />
          <span className="text-lg font-bold">메뉴</span>
        </div>
      </div>
      <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />
      <div className="mt-[20px] flex w-full flex-col px-[28px]">
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
