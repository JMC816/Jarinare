import backward from '@/assets/icons/backward.png';
import { useNoticeHandler } from '@/features/Board/hooks/useNoticeHandler';
import NoticeForm from '@/widgets/Board/ui/NoticeForm';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';

import { useNavigate } from 'react-router-dom';

const NoticeWirtePage = () => {
  const navigate = useNavigate();
  const notice = useNoticeHandler();

  return (
    <div className="flex h-screen w-full flex-col bg-gray-100">
      <div className="flex w-full flex-col px-4 pl-[28px] pr-[27px]">
        <div className="mt-[30px] flex items-center gap-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">공지사항 작성</h1>
        </div>
        <NoticeForm {...notice} />
      </div>
      {notice.loading ? <LoadingScreen /> : null}
    </div>
  );
};
export default NoticeWirtePage;
