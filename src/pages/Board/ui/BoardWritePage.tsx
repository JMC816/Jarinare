import backward from '@/assets/icons/backward.png';
import { useBaordHandler } from '@/features/Board/hooks/useBoardHandler';
import BoardForm from '@/widgets/Board/ui/BoardForm';
import LoadingScreen from '@/widgets/Board/ui/LoadingScreen';
import PCWriteForm from '@/widgets/Board/ui/PCWriteForm';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/shared/firebase/firebase';
import PCLoginRequiredPage from '@/widgets/layouts/ui/PCLoginRequiredPage';
import LoginRequiredBlock from '@/shared/ui/LoginRequiredBlock';

const LoginRequired = ({ onLogin }: { onLogin: () => void }) => (
  <>
    <div className="hidden w-full lg:block">
      <PCLoginRequiredPage
        description="로그인 후 글을 작성할 수 있어요"
        onLogin={onLogin}
      />
    </div>
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 lg:hidden">
      <LoginRequiredBlock
        description="로그인 후 글을 작성할 수 있어요"
        onLogin={onLogin}
      />
    </div>
  </>
);

const BoardWirtePage = () => {
  const navigate = useNavigate();
  const board = useBaordHandler({ navigateTo: '/board/boardlist' });

  if (!auth.currentUser)
    return <LoginRequired onLogin={() => navigate('/auth/login')} />;

  return (
    <>
      {/* PC */}
      <div className="hidden w-full lg:block">
        <PCWriteForm
          {...board}
          categoryLabel="자유"
          backLabel="자유게시판"
          tags={board.tags}
          tagInput={board.tagInput}
          onTagInputChange={board.onTagInputChange}
          onTagInputKeyDown={board.onTagInputKeyDown}
          onRemoveTag={board.onRemoveTag}
        />
      </div>

      {/* 모바일 */}
      <div className="flex h-screen w-full flex-col bg-gray-100 lg:hidden">
        <div className="flex w-full flex-col px-4 pl-[28px] pr-[27px]">
          <div className="mt-[30px] flex items-center gap-4">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <h1 className="text-lg font-bold">자유게시판 작성</h1>
          </div>
          <BoardForm {...board} />
        </div>
        {board.loading ? <LoadingScreen /> : null}
      </div>
    </>
  );
};

export default BoardWirtePage;
