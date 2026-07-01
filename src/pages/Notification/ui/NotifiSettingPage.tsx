import { useIsNotification } from '@/features/Notification/hooks/useIsNotification';
import { useIsNotificationResponse } from '@/features/Notification/hooks/useIsNotificationResponse';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { Toggle } from '@/widgets/Notification/ui/Toggle';
import PCNotifiSettingPage from './PCNotifiSettingPage';

export const NotifiSettingPage = () => {
  const { updateIsChange, updateIsResponse } = useIsNotification();
  const { isNotification } = useIsNotificationResponse();

  if (!isNotification) {
    return null;
  }

  const data = isNotification.data() ?? {};
  const changeOn = data.change ?? false;
  const responseOn = data.response ?? false;
  const allOn = changeOn && responseOn;

  // 좌석 변경 요청 알림 활성화 유무 선택
  const handleChangeToggle = () => {
    updateIsChange(!changeOn);
  };

  // 변경 수락/거절 알림 활성화 유무 선택
  const handleResponseToggle = () => {
    updateIsResponse(!responseOn);
  };

  // 전체 알림
  const handleAllToggle = () => {
    updateIsChange(!(changeOn && responseOn));
    updateIsResponse(!(changeOn && responseOn));
  };

  return (
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCNotifiSettingPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col bg-gray-100 lg:hidden">
        <div className="bg-gray-100 px-[28px]">
          <BackWardPageButton title="알림 설정" />
        </div>

        <div className="mt-2 px-[28px]">
          {/* 전체 알림 카드 */}
          <div className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-gray-900">
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
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-gray-900">
                  좌석 변경 요청
                </span>
                <span className="text-xs text-gray-400">
                  다른 사용자의 변경 요청 알림
                </span>
              </div>
              <Toggle toggle={changeOn} handleToggle={handleChangeToggle} />
            </div>
            <div className="mx-5 border-t border-gray-100" />
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-bold text-gray-900">
                  수락 / 거절 알림
                </span>
                <span className="text-xs text-gray-400">
                  변경 요청 수락 또는 거절 알림
                </span>
              </div>
              <Toggle toggle={responseOn} handleToggle={handleResponseToggle} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
