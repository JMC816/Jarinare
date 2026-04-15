import backward from '@/assets/icons/backward.png';
import plus from '@/assets/icons/plus.png';
import { useBoardSeen } from '@/features/Board/hooks/useBoardSeen';
import { Board } from '@/widgets/Board/ui/Board';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BoardListPage = () => {
  const navigate = useNavigate();
  const { markSeen } = useBoardSeen();

  useEffect(() => {
    markSeen('board');
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-gray-100">
      {/* 헤더 */}
      <div className="flex w-full items-center justify-between bg-white px-[27px] py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <h1 className="text-lg font-bold">자유게시판</h1>
        </div>
        <div
          onClick={() => navigate('/board/board')}
          className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md border-[1.5px] border-gray-700"
        >
          <img
            src={plus}
            className="h-[14px] w-[14px]"
            style={{ filter: 'brightness(0)' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Board />
      </div>
    </div>
  );
};

export default BoardListPage;
