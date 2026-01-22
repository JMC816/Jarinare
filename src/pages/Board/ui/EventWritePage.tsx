import backward from '@/assets/icons/backward.png';
import EventForm from '@/widgets/Board/ui/EventForm';

import { useNavigate } from 'react-router-dom';

const EventWirtePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex h-[60px] w-full flex-col px-4 pl-[28px] pr-[27px]">
        <img
          onClick={() => navigate(-1)}
          src={backward}
          className="mt-[30px] h-[20px] w-[12px] cursor-pointer"
        />
        <h1 className="mt-5 text-lg font-bold">이벤트 작성</h1>
        <EventForm />
      </div>
    </div>
  );
};
export default EventWirtePage;
