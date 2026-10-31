import backward from '@/assets/icons/backward.png';
import { Board } from '@/widgets/Board/ui/Board';
import { useNavigate } from 'react-router-dom';
import WriteButton from '@/shared/ui/WriteButton';
import PCBoardListPage from './PCBoardListPage';

const BoardListPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="hidden w-full lg:block">
        <PCBoardListPage />
      </div>
      <div className="flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        {/* 헤더 */}
        <div className="flex w-full items-center px-[28px] pt-[20px]">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-base font-bold">자유게시판</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-[80px]">
          <Board />
        </div>

        <WriteButton onClick={() => navigate('/board/board')} />
      </div>
    </>
  );
};

export default BoardListPage;
