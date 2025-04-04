import PlaceInput from './PlaceInput';
import PlaceTitle from './PlaceTitle';
import RecommendStationList from './RecommendStation';
import StationList from './StationList';

const EndPlaceModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <div className="pl-[28px] pr-[27px]">
        <PlaceTitle text="도착지 선택해주세요" />
        <PlaceInput placeholder="도착역 선택" />
        <RecommendStationList modalType={'EndPlaceModal'} />
      </div>
      <div className="mt-5 w-full border border-lightGray" />
      <StationList />
    </div>
  );
};

export default EndPlaceModal;
