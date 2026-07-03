/**
 * @role: pages — PC 알림 설정 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useIsNotification } from '@/features/Notification/hooks/useIsNotification';
import { useIsNotificationResponse } from '@/features/Notification/hooks/useIsNotificationResponse';
import PCLoginRequiredPage from '@/widgets/layouts/ui/PCLoginRequiredPage';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { Toggle } from '@/widgets/Notification/ui/Toggle';
import { usePCNotifiSettingPage } from '../hooks/usePCNotifiSettingPage';

const PCNotifiSettingPage = () => {
  const { updateIsChange, updateIsResponse } = useIsNotification();
  const { isNotification } = useIsNotificationResponse();
  const { isLoggedIn, handleLoginNavigate } = usePCNotifiSettingPage();

  if (!isLoggedIn) {
    return (
      <PCLoginRequiredPage
        description="로그인 후 알림 설정을 이용할 수 있어요"
        onLogin={handleLoginNavigate}
      />
    );
  }

  if (!isNotification) return null;

  const data = isNotification.data() ?? {};
  const changeOn = data.change ?? false;
  const responseOn = data.response ?? false;
  const allOn = changeOn && responseOn;

  const handleChangeToggle = () => updateIsChange(!changeOn);
  const handleResponseToggle = () => updateIsResponse(!responseOn);
  const handleAllToggle = () => {
    updateIsChange(!allOn);
    updateIsResponse(!allOn);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <PCTopNav />

      <div className="flex w-full flex-1 gap-0">
        <PCSidebar />

        <main
          className="relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="mx-auto max-w-2xl px-10 pb-16 pt-10">
            <h1 className="mb-6 text-2xl font-black text-gray-900">
              알림 설정
            </h1>

            <div className="flex flex-col gap-4">
              {/* 전체 알림 카드 */}
              <div className="rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900">
                      전체 알림
                    </span>
                    <span className="text-xs text-gray-400">
                      모든 알림을 한번에 켜고 끕니다
                    </span>
                  </div>
                  <Toggle toggle={allOn} handleToggle={handleAllToggle} />
                </div>
              </div>

              {/* 개별 알림 카드 */}
              <div className="rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900">
                      좌석 변경 요청
                    </span>
                    <span className="text-xs text-gray-400">
                      다른 사용자의 변경 요청 알림
                    </span>
                  </div>
                  <Toggle toggle={changeOn} handleToggle={handleChangeToggle} />
                </div>
                <div className="mx-6 border-t border-gray-100" />
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900">
                      수락 / 거절 알림
                    </span>
                    <span className="text-xs text-gray-400">
                      변경 요청 수락 또는 거절 알림
                    </span>
                  </div>
                  <Toggle
                    toggle={responseOn}
                    handleToggle={handleResponseToggle}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCNotifiSettingPage;
