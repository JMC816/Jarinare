import miniarrow from '@/assets/icons/miniarrow.png';
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatAM_PM, formatTimeView } from '@/shared/lib/formatDate';
import { useNavigation } from '../hooks/ReserveHook';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';

const ReserveTicket = () => {
  const ticketData = useTicketLists();
  const { navigate } = useNavigation();
  const {
    setStartDay,
    setSelectStartTime,
    setSelectTrainType,
    setSeatsId,
    setTrainNo,
  } = trainDataStore();

  // 로그인하지 않았거나 티켓이 없는 경우
  if (
    !ticketData ||
    !ticketData.groupedArray ||
    ticketData.groupedArray.length === 0
  ) {
    return (
      <div className="mb-[100px] flex h-[100px] w-[320px] flex-col items-center justify-center rounded-sm bg-lightestGray">
        <span>🗒️</span>
        <span className="text-tiny font-bold">아직 예매한 승차권이 없어요</span>
      </div>
    );
  }

  const { groupedArray } = ticketData;

  return (
    <div
      onClick={() => {
        navigate('/ticket/seatchange', {
          state: { groups: groupedArray[0] },
        });
        setStartDay(groupedArray[0][0].startDay);
        setSelectStartTime(groupedArray[0][0].startTime);
        setSelectTrainType(groupedArray[0][0].trainType);
        setTrainNo(groupedArray[0][0].trainNoId);
        setSeatsId(groupedArray[0].map((item) => item.seatId));
      }}
      className="mb-[100px] flex h-[100px] w-[320px]"
    >
      <div className="flex h-[100px] w-[230px] flex-col items-center justify-between rounded-lg bg-lightestGray py-[15px]">
        <div className="flex h-5 w-[200px] items-center justify-center rounded-xs bg-white">
          <span className="text-xs font-bold text-blue">
            {groupedArray[0][0].startDayForView}
          </span>
        </div>
        <div className="flex h-[45px] w-[200px] flex-col justify-center rounded-xs bg-white">
          <div className="flex items-center justify-around px-[10px] text-black">
            <div className="flex flex-col items-center">
              <span className="text-base font-bold">
                {groupedArray[0][0].startStationForView}
              </span>
              <span className="text-sm">
                {formatAM_PM(String(groupedArray[0][0].startTime)) < 12
                  ? '오전'
                  : '오후'}{' '}
                {formatTimeView(String(groupedArray[0][0].startTime))}
              </span>
            </div>
            <img src={miniarrow} className="h-[10px] w-[15px]" />
            <div className="flex flex-col items-center">
              <span className="text-base font-bold">
                {groupedArray[0][0].endStationForView}
              </span>
              <span className="text-sm">
                {formatAM_PM(String(groupedArray[0][0].endTime)) < 12
                  ? '오전'
                  : '오후'}{' '}
                {formatTimeView(String(groupedArray[0][0].endTime))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[100px] w-[90px] items-center justify-center rounded-lg bg-lightBlue text-center text-base font-bold text-blue">
        {groupedArray[0][0].trainType.slice(0, 3)}
        <br />
        {groupedArray[0][0].trainType.slice(4)}
      </div>
    </div>
  );
};

export default ReserveTicket;
