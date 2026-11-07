/**
 * @role: pages — 공지사항 작성 페이지
 * @rule: 레이아웃·조합만 담당, admin 접근 가드 포함
 */
import backward from '@/assets/icons/backward.png';
import { useNoticeHandler } from '@/features/Board/hooks/useNoticeHandler';
import NoticeForm from '@/widgets/Board/ui/NoticeForm';
import LoadingScreen from '@/widgets/layouts/ui/LoadingScreen';
import PCWriteForm from '@/widgets/Board/ui/PCWriteForm';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useHasPermission } from '@/features/Auth/hooks/useHasPermission';

const NoticeWirtePage = () => {
  const navigate = useNavigate();
  const { isLoading } = useCurrentUser();
  const isAdmin = useHasPermission('board:create');
  const notice = useNoticeHandler({ navigateTo: '/board/noticelist' });

  if (isLoading) return null;
  if (!isAdmin) {
    navigate('/board/noticelist', { replace: true });
    return null;
  }

  return (
    <>
      {/* PC */}
      <div className="hidden w-full lg:block">
        <PCWriteForm
          {...notice}
          categoryLabel={notice.isEditMode ? '공지사항 수정' : '공지'}
          backLabel="공지사항"
        />
      </div>

      {/* 모바일 */}
      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        <div className="flex w-full items-center bg-white/80 px-[28px] pb-[4px] pt-[20px] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img
              onClick={() => navigate(-1)}
              src={backward}
              className="h-[20px] w-[12px] cursor-pointer"
            />
            <span className="text-lg font-bold">
              {notice.isEditMode ? '공지사항 수정' : '공지사항 작성'}
            </span>
          </div>
        </div>
        <div className="h-2 w-full border-b border-gray-200/50 bg-white/80" />
        <div className="flex w-full flex-col px-[28px]">
          <NoticeForm {...notice} />
        </div>
        {notice.loading ? <LoadingScreen /> : null}
      </div>
    </>
  );
};

export default NoticeWirtePage;
