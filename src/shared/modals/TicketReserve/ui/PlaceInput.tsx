import { ReservePlaceholder } from '../types/Reserve';

const PlaceInput = ({ placeholder }: ReservePlaceholder) => {
  return (
    <input
      className="h-12 w-[320px] rounded-md border border-lightGray bg-lightestGray px-[15px] text-tiny"
      placeholder={placeholder}
    />
  );
};

export default PlaceInput;
