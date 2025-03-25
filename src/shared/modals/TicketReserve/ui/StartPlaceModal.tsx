import PlaceInput from './PlaceInput';
import PlaceTitle from './PlaceTitle';
import RecommendStationList from './RecommendStation';
import StationList from './StationList';

const StartPlaceModal = () => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-white">
      <div className="pl-[28px] pr-[27px]">
        <PlaceTitle text="출발지를 선택해주세요" />
        <PlaceInput placeholder="출발역 선택" />
        <RecommendStationList />
      </div>
      <div className="mt-5 w-full border border-lightGray" />
      <StationList />
    </div>
  );
};

export default StartPlaceModal;
