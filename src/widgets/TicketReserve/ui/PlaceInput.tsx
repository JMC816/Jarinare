import { useHideInput } from '../hooks/PlaceInputHook';
import { ReservePlaceholder } from '../types/ReserveType';

const PlaceInput = ({ placeholder }: ReservePlaceholder) => {
  const { onChange } = useHideInput();
  return (
    <input
      onChange={onChange}
      className="h-12 w-[320px] rounded-md border border-lightGray bg-lightestGray px-[15px] text-tiny"
      placeholder={placeholder}
    />
  );
};

export default PlaceInput;
