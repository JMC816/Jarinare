import backward from '@/assets/icons/backward.png';
import { useBackButton } from '../hooks/BackWardHook';

const BackWardPageButton = () => {
  const { onClick } = useBackButton();
  return (
    <div className="flex w-full justify-start">
      <img
        onClick={onClick}
        src={backward}
        className="mt-[30px] h-[20px] w-[12px] cursor-pointer"
      />
    </div>
  );
};

export default BackWardPageButton;
