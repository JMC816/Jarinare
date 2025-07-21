import miniarrow from '@/assets/icons/miniarrow.png';
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import { formatAM_PM, formatTimeView } from '@/shared/lib/formatDate';
import { useNavigation } from '../hooks/useNavigation';
import { groupSeatsStore } from '../model/groupSeatsStore';

const MiniTicket = () => {
  const { groupedArray } = useTicketLists() ?? {};
  const { setGroupSeats } = groupSeatsStore();
  const { navigate } = useNavigation();

  return groupedArray?.map((groups, idx) => (
    <div
      key={idx}
      onClick={() => {
        navigate('/ticket/seatchange', { state: { groups } });
        setGroupSeats(groups);
      }}
      className="flex h-[100px] w-[320px]"
    >
      <div className="flex h-[100px] w-[230px] flex-col items-center justify-between rounded-lg bg-lightestGray py-[15px]">
        <div className="flex h-5 w-[200px] items-center justify-center rounded-xs bg-white">
          <span className="text-xs font-bold text-blue">
            {groups[0].startDayForView}
          </span>
        </div>
        <div className="flex h-[45px] w-[200px] flex-col justify-center rounded-xs bg-white">
          <div className="flex items-center justify-around px-[10px] text-black">
            <div className="flex flex-col items-center">
              <span className="text-base font-bold">
                {groups[0].startStationForView}
              </span>
              <span className="text-sm">
                {formatAM_PM(String(groups[0].startTime)) < 12
                  ? '오전'
                  : '오후'}{' '}
                {formatTimeView(String(groups[0].startTime))}
              </span>
            </div>
            <img src={miniarrow} className="h-[10px] w-[15px]" />
            <div className="flex flex-col items-center">
              <span className="text-base font-bold">
                {groups[0].endStationForView}
              </span>
              <span className="text-sm">
                {formatAM_PM(String(groups[0].endTime)) < 12 ? '오전' : '오후'}{' '}
                {formatTimeView(String(groups[0].endTime))}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-[100px] w-[90px] items-center justify-center rounded-lg bg-lightBlue text-center text-base font-bold text-blue">
        {groups[0].trainType.slice(0, 3)}
        <br />
        {groups[0].trainType.slice(4)}
      </div>
    </div>
  ));
};

export default MiniTicket;
