import { useCheckStationStore } from '../model/PlaceInputStroe';
import useModalStore from '@/widgets/model/ReserveStore';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';

const StartStationList = () => {
  const { isValue } = useCheckStationStore();
  const { closeModal } = useModalStore();
  const { setStartStation } = trainDataStore();
  const { stations, isLoading } = trainQueryData();

  const filtered = isValue
    ? stations.filter(
        (station) => station && station.nodename.includes(isValue),
      )
    : stations;

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="w-full overflow-y-scroll px-[10px] pt-[10px]">
      {filtered.map((station) => {
        if (!station || !station.nodename) return null;
        return (
          <div
            key={station.nodeid}
            onClick={() => {
              closeModal('StartPlaceModal');
              setStartStation(station.nodename);
            }}
            className="flex h-[50px] w-full cursor-pointer items-center px-[17px] py-[9px] text-base font-bold text-darkGray hover:rounded-md hover:bg-lightestGray active:brightness-50"
          >
            {station.nodename}
          </div>
        );
      })}
    </div>
  );
};

export default StartStationList;
