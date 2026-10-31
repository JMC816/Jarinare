import backward from '@/assets/icons/backward.png';
import { useBackButton } from '../hooks/BackWardHook';

type Props = {
  title?: string;
  step?: string;
};

const BackWardPageButton = ({ title, step }: Props = {}) => {
  const { onClick } = useBackButton();
  return (
    <div className="flex w-full items-center pt-[20px]">
      <div className="flex items-center gap-3">
        <img
          onClick={onClick}
          src={backward}
          className="h-[20px] w-[12px] cursor-pointer"
        />
        {title && (
          <span className="text-base font-bold text-black">{title}</span>
        )}
      </div>
      {step && (
        <span className="ml-auto rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-darkGray">
          {step}
        </span>
      )}
    </div>
  );
};

export default BackWardPageButton;
