import useModalStore from '@/widgets/model/ReserveStore';
import { usePlaceInputStore } from '../model/PlaceInputStroe';
import EndRecommendStationList from './EndRecommendStation';
import EndStationList from './EndStationList';
import PlaceInput from './PlaceInput';
import PlaceTitle from './PlaceTitle';
import BackWardModalButton from '@/widgets/layouts/ui/BackWardModalButton';

const EndPlaceModal = () => {
  const { isShow } = usePlaceInputStore();
  const { closeModal } = useModalStore();
  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <div className="pl-[28px] pr-[27px]">
        <BackWardModalButton backPage={() => closeModal('EndPlaceModal')} />
        <PlaceTitle text="도착지 선택해주세요" />
        <PlaceInput placeholder="도착역 선택" />
        {isShow ? null : (
          <EndRecommendStationList modalType={'EndPlaceModal'} />
        )}
      </div>
      {isShow ? null : <div className="mt-5 w-full border border-lightGray" />}
      <EndStationList />
    </div>
  );
};

export default EndPlaceModal;
