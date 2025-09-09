import Calendar from 'react-calendar';
import '@/widgets/TicketReserve/styles/react-calendar.css';
import moment from 'moment';
import prev from '@/assets/icons/prev.png';
import next from '@/assets/icons/next.png';
import Button from '@/shared/ui/Button';
import useModalStore from '../../model/ReserveStore';
import { useDaySelect, useMaxDate } from '../hooks/ReserveHook';
import CrossModalButton from '@/widgets/layouts/ui/CrossModalButton';

const DayModal = () => {
  const { value, onChange } = useDaySelect();
  const { closeModal } = useModalStore();
  const { maxDate } = useMaxDate();
  return (
    <div className="flex h-full w-full flex-col items-center justify-end bg-darkGray/50">
      <div className="mb-[15px] flex h-[400px] w-[345px] flex-col items-center rounded-2xl bg-white">
        <div className="flex w-full justify-between pb-[20px] pl-[40px] pr-[40px] pt-[25px]">
          <span className="w-full text-base font-bold">가는 날</span>
          <div>
            <CrossModalButton closeModal={() => closeModal('DayModal')} />
          </div>
        </div>
        <Calendar
          minDate={new Date()}
          maxDate={maxDate}
          onChange={onChange}
          prev2Label={null}
          next2Label={null}
          prevLabel={
            <div className="flex h-[20px] w-[20px] items-center justify-center">
              <img width={9} height={15} src={prev} />
            </div>
          }
          nextLabel={
            <div className="flex h-[20px] w-[20px] items-center justify-center">
              <img width={9} height={15} src={next} />
            </div>
          }
          value={value}
          formatDay={(_, date) => moment(date).format('DD')}
        />
        <div className="mb-[15px]">
          <Button
            bgColor="blue"
            text="선택"
            textColor="white"
            onModalClick={() => closeModal('DayModal')}
          />
        </div>
      </div>
    </div>
  );
};

export default DayModal;
