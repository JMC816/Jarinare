import { useNavigation } from '../types/useNavigation';
import useModalStore from '@/widgets/model/AuthStore';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useCurrentUser } from '@/features/Auth/hooks/useCurrentUser';

const UserInfo = () => {
  const { user, isLoggedIn } = useCurrentUser();
  const { navigation } = useNavigation();
  const { resetModal } = useModalStore();

  if (!isLoggedIn || !user) return null;

  const displayName = user.name || user.userId;
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await backendClient.post('/oauth/logout').catch(() => {});
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    resetModal();
    navigation('/');
  };

  return (
    <div className="flex w-full items-center gap-x-4 px-1 py-2">
      {/* 이니셜 아바타 */}
      <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-gray-300">
        <span className="text-xl font-bold text-white">{initial}</span>
      </div>

      {/* 이름 + 등급 */}
      <div className="flex flex-1 flex-col gap-y-[2px]">
        <span className="text-base font-bold text-black">{displayName}</span>
        <span className="text-xs text-gray-400">일반회원</span>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={handleLogout}
        className="rounded-lg bg-lightImpossible px-3 py-2 text-xs font-bold text-red transition-all active:brightness-95"
      >
        로그아웃
      </button>
    </div>
  );
};

export default UserInfo;
