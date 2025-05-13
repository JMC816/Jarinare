import useModalStore from '@/widgets/model/ReserveStore';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';
import {
  formatAM_PM,
  formatTime,
  formatTimeView,
  formatTodayDate,
  isToday,
} from '../lib/formatDate';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import SkeletonScreen from '@/widgets/layouts/ui/SkeletonScreen';
import { useRefetchByStartTime } from '../hooks/ReserveHook';
import TrainTimeChocieButton from './TrainTimeChoiceButton';
import { trainTimeInfoStore } from '@/features/TicketReserve/model/trainTimeInfoStore';

const TrainList = () => {
  const { openModal } = useModalStore();
  const { isFetching, trainTime } = trainQueryData();
  const { startDay, startTime, kid, adult } = trainDataStore();
  const today = isToday();
  const {
    setSelectStartTime,
    setSelectEndTime,
    setSelectTrainType,
    setSelectKid,
    setSelectAdult,
    setSelectPay,
  } = trainTimeInfoStore();

  // startTime이 변경되면 자동으로 기차 시간 목록 업데이트
  useRefetchByStartTime();

  const filtered = trainTime.filter((time) => {
    // 오늘 날짜가 기차 출발 날짜와 동일하면 현재 시간 이후의 기차 시간 목록만 보여주지만,
    // 오늘 날짜에서 선택한 시간이 현재 시간 이후면 선택한 시간 이후의 기차 시간 목록만 보여준다.
    if (startDay === today) {
      if (startTime > formatTime()) {
        return (
          String(time.depplandtime).toString().substring(8, 12) >= startTime
        );
      }
      return time.depplandtime >= formatTodayDate();
    }
    // 그렇지 않으면 선택한 시간 이후의 기차 시간 목록만 보여줌.
    return String(time.depplandtime).toString().substring(8, 12) >= startTime;
  });

  if (isFetching)
    return (
      <div className="h-[100vh]">
        <SkeletonScreen />
      </div>
    );

  return (
    <div className="mt-[40px] flex w-full flex-col gap-y-[30px] overflow-y-auto">
      {filtered.length === 0 ? (
        <span className="flex justify-center text-tiny font-bold">
          조회된 열차 목록이 없어요.
        </span>
      ) : (
        filtered.map(
          (
            {
              depplandtime,
              arrplandtime,
              traingradename,
              adultcharge,
              trainno,
            },
            idx,
          ) => (
            <div key={idx} className="flex w-full items-center justify-between">
              <div>
                <span className="text-lg font-bold">
                  {formatAM_PM(String(depplandtime)) < 12 ? '오전' : '오후'}{' '}
                  {/* 출발 시간 */}
                  {formatTimeView(String(depplandtime))} -{' '}
                  {formatAM_PM(String(arrplandtime)) < 12 ? '오전' : '오후'}{' '}
                  {/* 도착 시간 */}
                  {formatTimeView(String(arrplandtime))}
                </span>
                <div className="flex justify-between text-tiny">
                  <span className="font-bold text-blue">
                    {traingradename}-{trainno}
                  </span>
                  <span className="text-darkGray">
                    {adultcharge === 0 ? (
                      <span className="text-red">매진</span>
                    ) : (
                      adultcharge + '원'
                    )}
                  </span>
                </div>
              </div>
              <TrainTimeChocieButton
                text="선택"
                onModalClick={() => {
                  openModal('ChoiceResultModal');
                  setSelectStartTime(depplandtime);
                  setSelectEndTime(arrplandtime);
                  setSelectTrainType(traingradename + '-' + trainno);
                  setSelectKid(kid);
                  setSelectAdult(adult);
                  setSelectPay(adultcharge);
                }}
              />
            </div>
          ),
        )
      )}
    </div>
  );
};

export default TrainList;
