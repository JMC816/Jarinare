import backward from '@/assets/icons/backward.png';
import WriteButton from '@/shared/ui/WriteButton';
import { Notice } from '@/widgets/Board/ui/Notice';
import { useNavigate } from 'react-router-dom';
import PCNoticeListPage from './PCNoticeListPage';

const NoticeListPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCNoticeListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-lg font-bold">공지사항</span>
          </div>
        </div>
        <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />

        <div className="flex-1 overflow-y-auto pb-[80px]">
          <Notice />
        </div>

        <WriteButton onClick={() => navigate('/board/notice')} />
      </div>
    </>
  );
};

export default NoticeListPage;
