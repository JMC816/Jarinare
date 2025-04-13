import backward from '@/assets/icons/backward.png';
import { BackWardProps } from '../types/BackWardType';

const BackWardPageButton = ({ backPage }: BackWardProps) => {
  return (
    <div className="flex w-full justify-start">
      <img
        onClick={backPage}
        src={backward}
        className="mt-[30px] h-[20px] w-[12px] cursor-pointer"
      />
    </div>
  );
};

export default BackWardPageButton;
