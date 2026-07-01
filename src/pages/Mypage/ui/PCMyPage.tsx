/**
 * @role: pages — PC 마이페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useNavigate } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import SlotNumber from '@/widgets/Point/ui/SlotNumber';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { useFollowList } from '@/features/Follow/hooks/useFollowList';
import { auth } from '@/shared/firebase/firebase';
import { getProfileColor } from '@/shared/lib/profileColor';
import { useNaviation } from '../hooks/useNavigation';
import useModalStore from '@/widgets/model/AuthStore';

const PCMyPage = () => {
  const { point } = useGetPoint();
  const { navigate } = useNaviation();
  const { resetModal } = useModalStore();
  const { counts } = useFollowList();
  const routerNavigate = useNavigate();
  const user = auth.currentUser;

  if (!user) return null;

  const displayName = user.displayName ?? user.uid;
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    auth.signOut();
    resetModal();
    navigate('/');
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
              마이페이지
            </h1>

            <div className="flex flex-col gap-4">
              {/* 프로필 카드 */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
                      style={{ backgroundColor: getProfileColor(displayName) }}
                    >
                      {initial}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-base font-bold text-gray-900">
                        {displayName}
                      </span>
                      <span className="text-sm text-gray-400">일반회원</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red/10 px-4 py-2 text-sm font-bold text-red transition-colors hover:bg-red/20"
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              {/* 팔로우 카드 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => routerNavigate('/mypage/follow?tab=followers')}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white py-5 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <span className="text-2xl font-black text-gray-900">
                    {counts.followers}
                  </span>
                  <span className="text-sm text-gray-400">팔로워</span>
                </button>
                <button
                  onClick={() => routerNavigate('/mypage/follow?tab=following')}
                  className="flex flex-col items-center gap-1 rounded-xl bg-white py-5 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <span className="text-2xl font-black text-gray-900">
                    {counts.following}
                  </span>
                  <span className="text-sm text-gray-400">팔로잉</span>
                </button>
              </div>

              {/* 포인트 카드 */}
              <div className="rounded-xl bg-blue p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-white/70">
                      내 포인트
                    </span>
                    <SlotNumber
                      value={point}
                      className="text-3xl font-bold text-white"
                    />
                  </div>
                  <button
                    onClick={() => navigate('/mypage/point')}
                    className="rounded-lg bg-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/30"
                  >
                    더보기
                  </button>
                </div>
              </div>

              {/* 앱 정보 */}
              <div className="rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                      v
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      버전
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCMyPage;
