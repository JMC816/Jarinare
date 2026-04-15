import backward from '@/assets/icons/backward.png';
import { useEventHandler } from '@/features/Board/hooks/useEventHandler';
import EventForm from '@/widgets/Board/ui/EventForm';
import LoadingScreen from '@/widgets/Board/ui/LoadingScreen';

import { useNavigate } from 'react-router-dom';

const EventWirtePage = () => {
  const navigate = useNavigate();
  const event = useEventHandler();
  return (
    <div className="flex h-screen w-full flex-col bg-gray-100">
      <div className="flex w-full flex-col px-4 pl-[28px] pr-[27px]">
        <div className="mt-[30px] flex items-center gap-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">이벤트 작성</h1>
        </div>
        <EventForm {...event} />
      </div>
      {event.loading ? <LoadingScreen /> : null}
    </div>
  );
};
export default EventWirtePage;
