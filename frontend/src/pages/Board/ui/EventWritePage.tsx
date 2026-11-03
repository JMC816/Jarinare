/**
 * @role: pages — 이벤트 작성·수정 페이지
 * @rule: 렌더링·조합만 담당, admin 접근 가드 포함
 */
import backward from '@/assets/icons/backward.png';
import { useEventHandler } from '@/features/Board/hooks/useEventHandler';
import EventForm from '@/widgets/Board/ui/EventForm';
import LoadingScreen from '@/widgets/Board/ui/LoadingScreen';
import PCWriteForm from '@/widgets/Board/ui/PCWriteForm';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';
import { useHasPermission } from '@/features/Auth/hooks/useHasPermission';

const EventWirtePage = () => {
  const navigate = useNavigate();
  const { isLoading } = useCurrentUser();
  const isAdmin = useHasPermission('board:create');
  const event = useEventHandler({ navigateTo: '/board/eventlist' });
  const { isEditMode } = event;

  if (isLoading) return null;
  if (!isAdmin) {
    navigate(-1);
    return null;
  }

  return (
    <>
      {/* PC */}
      <div className="hidden w-full lg:block">
        <PCWriteForm
          {...event}
          categoryLabel={isEditMode ? '이벤트 수정' : '이벤트'}
          backLabel="이벤트"
        />
      </div>

      {/* 모바일 */}
      <div className="flex h-screen w-full flex-col bg-gray-50 lg:hidden">
        <div className="flex w-full flex-col px-[28px]">
          <div className="flex w-full items-center pt-[20px]">
            <div className="flex items-center gap-3">
              <img
                onClick={() => navigate(-1)}
                src={backward}
                className="h-[20px] w-[12px] cursor-pointer"
              />
              <span className="text-base font-bold">
                {isEditMode ? '이벤트 수정' : '이벤트 작성'}
              </span>
            </div>
          </div>
          <EventForm {...event} />
        </div>
        {event.loading ? <LoadingScreen /> : null}
      </div>
    </>
  );
};

export default EventWirtePage;
