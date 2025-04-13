import backward from '@/assets/icons/backward.png';
import { BackWardProps } from '../types/BackWardType';

const BackWardModalButton = ({
  modalType,
  openModal,
  closeModal,
}: BackWardProps) => {
  return (
    <div className="flex w-full justify-start">
      <img
        onClick={() => {
          closeModal!(modalType!);
          openModal!(modalType!);
        }}
        src={backward}
        className="mt-[30px] h-[20px] w-[12px] cursor-pointer"
      />
    </div>
  );
};

export default BackWardModalButton;
