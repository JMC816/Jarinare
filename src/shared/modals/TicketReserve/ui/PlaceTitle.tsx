import { ReserveProps } from '../types/Reserve';

const PlaceTitle = ({ text }: ReserveProps) => {
  return (
    <div className="mb-[25px] mt-[60px] flex w-full items-center">
      <span className="text-lg font-bold">{text}</span>
    </div>
  );
};

export default PlaceTitle;
