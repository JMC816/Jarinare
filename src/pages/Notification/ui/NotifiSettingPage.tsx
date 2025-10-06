import { useIsNotification } from '@/features/Notification/hooks/useIsNotification';
import { useIsNotificationResponse } from '@/features/Notification/hooks/useIsNotificationResponse';
import { useKakaoLink } from '@/features/Notification/hooks/useKakaoLink';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { Toggle } from '@/widgets/Notification/ui/Toggle';
import kakao from '@/assets/social/kakao.png';
import { auth } from '@/shared/firebase/firebase';

export const NotifiSettingPage = () => {
  const { updateIsChange, updateIsResponse } = useIsNotification();
  const { isNotification } = useIsNotificationResponse();
  const { onClick } = useKakaoLink();

  // 카카오 연동 유무
  const userId = auth.currentUser?.providerData[0].providerId;

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
      <div className="mb-[20px] mt-[20px] h-5 w-full bg-lightestGray" />
      <div className="flex w-full flex-col pl-[28px] pr-[27px]">
        <span className="text-base font-bold">계정 연동</span>
        <div className="mt-5 rounded-md bg-lightestGray p-5 text-darkGray">
          💡 계정 연동 시 카카오톡으로 알림을 받을 수 있습니다.
        </div>
        <button
          onClick={onClick}
          disabled={userId === 'oidc.kakao' ? true : false}
          className="relative mt-5 flex h-12 w-full items-center justify-center rounded-sm bg-yellow-300 text-base font-bold text-black active:brightness-50 disabled:bg-lightestGray disabled:text-lightGray disabled:active:brightness-100"
        >
          <img
            src={kakao}
            className="absolute left-[20px]"
            width={20}
            height={20}
          />
          카카오 아이디로 등록
        </button>
      </div>
    </div>
  );
};
