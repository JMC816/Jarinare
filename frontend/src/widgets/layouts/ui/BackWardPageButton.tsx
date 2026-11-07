import backward from '@/assets/icons/backward.png';
import { useBackButton } from '../hooks/BackWardHook';

type Props = {
  title?: string;
  step?: string;
};

const BackWardPageButton = ({ title, step }: Props = {}) => {
  const { onClick } = useBackButton();
  return (
    <>
      <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            onClick={onClick}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          {title && (
            <span className="text-lg font-bold">{title}</span>
          )}
        </div>
        {step && (
          <span className="ml-auto rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-darkGray">
            {step}
          </span>
        )}
      </div>
      <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />
    </>
  );
};

export default BackWardPageButton;
