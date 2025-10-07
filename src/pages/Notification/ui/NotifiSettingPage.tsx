import { useIsNotification } from '@/features/Notification/hooks/useIsNotification';
import { useIsNotificationResponse } from '@/features/Notification/hooks/useIsNotificationResponse';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { Toggle } from '@/widgets/Notification/ui/Toggle';

export const NotifiSettingPage = () => {
  const { updateIsChange, updateIsResponse } = useIsNotification();
  const { isNotification } = useIsNotificationResponse();

  if (!isNotification) {
    return;
  }

  // 좌석 변경 요청 알림 활성화 유무 선택
  const handleChangeToggle = () => {
    updateIsChange(!isNotification.data()!.change);
  };

  // 변경 수락/거절 알림 활성화 유무 선택
  const handleResponseToggle = () => {
    updateIsResponse(!isNotification.data()!.response);
  };

  // 전체 알림
  const handleAllToggle = () => {
    updateIsChange(
      !(isNotification.data()!.change && isNotification.data()!.response),
    );
    updateIsResponse(
      !(isNotification.data()!.change && isNotification.data()!.response),
    );
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full flex-col pl-[28px] pr-[27px]">
        <BackWardPageButton />
        <div className="mt-5 flex w-full justify-between font-bold">
          <span className="text-lg">설정</span>
        </div>
      </div>
      <div className="flex w-full flex-col pl-[28px] pr-[27px] text-lg">
        <div className="mt-5 flex items-center justify-between">
          <span className="text-base">전체 알림</span>
          <Toggle
            toggle={
              isNotification.data()!.change && isNotification.data()!.response
            }
            handleToggle={handleAllToggle}
          />
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <span className="text-base">좌석 변경 알림</span>
          <Toggle
            toggle={isNotification.data()!.change}
            handleToggle={handleChangeToggle}
          />
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <span className="text-base">변경 수락/거절 알림</span>
          <Toggle
            toggle={isNotification.data()!.response}
            handleToggle={handleResponseToggle}
          />
        </div>
      </div>
    </div>
  );
};
