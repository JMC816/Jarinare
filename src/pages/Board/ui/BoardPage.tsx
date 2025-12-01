import { Board } from '@/widgets/Board/ui/Board';
import { Event } from '@/widgets/Board/ui/Event';
import { Notice } from '@/widgets/Board/ui/Notice';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backward from '@/assets/icons/backward.png';
import edit from '@/assets/icons/edit.png';
import { ComingSoonModal } from '@/shared/ui/ComingSoonModal';
// 샘플 데이터 (인스타그램 피드 형태)

const BoardPage = () => {
  const [activeTab, setActiveTab] = useState<'notice' | 'event' | 'board'>(
    'notice',
  );
  const navigate = useNavigate();
  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex w-full flex-col px-4 pl-[28px] pr-[27px]">
        <div className="mt-[30px] flex justify-between">
          <img
            onClick={() => navigate(-1)}
            src={backward}
            className="h-[20px] w-[12px] cursor-pointer"
          />
          <div
            onClick={
              activeTab === 'notice'
                ? () => navigate('/board/notice')
                : activeTab === 'event'
                  ? () => navigate('/board/event')
                  : () => navigate('/board/board')
            }
            className="relative flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full"
          >
            <img src={edit} className="absolute bottom-[5px]" />
          </div>
        </div>
      </div>
      <div className="mt-5 flex w-full border-b border-gray-200">
        <button
          onClick={() => setActiveTab('notice')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'notice'
              ? 'border-b-2 border-blue text-blue'
              : 'text-darkGray'
          }`}
        >
          공지사항
        </button>
        <button
          onClick={() => setActiveTab('event')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'event'
              ? 'border-b-2 border-blue text-blue'
              : 'text-darkGray'
          }`}
        >
          이벤트
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === 'board'
              ? 'border-b-2 border-blue text-blue'
              : 'text-gray-500'
          }`}
        >
          자유게시판
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {activeTab === 'notice' ? (
          <Notice />
        ) : activeTab === 'event' ? (
          <Event />
        ) : (
          <Board />
        )}
      </div>
      <div className="fixed mx-auto my-0 h-screen w-[375px]">
        <ComingSoonModal />
      </div>
    </div>
  );
};

export default BoardPage;
