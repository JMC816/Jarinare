import useModalStore from '../modals/model/ReserveStore';
import { MiniButtonProp } from '../types/Button';

const MiniButton = ({ text, modalTypes }: MiniButtonProp) => {
  const { openModal } = useModalStore();
  return (
    <button
      onClick={() => openModal(modalTypes!)}
      className="flex h-[30px] w-[50px] items-center justify-center rounded-sm bg-lightBlue"
    >
      <span className="text-sm font-bold text-blue">{text}</span>
    </button>
  );
};

export default MiniButton;
