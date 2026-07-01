/**
 * @role: pages — PC 팔로우/팔로워 목록 페이지
 * @rule: 레이아웃·조합만 담당, 비즈니스 로직 포함 금지
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PCTopNav from '@/widgets/layouts/ui/PCTopNav';
import PCSidebar from '@/widgets/layouts/ui/PCSidebar';
import { useFollowList } from '@/features/Follow/hooks/useFollowList';
import { useFollowListActions } from '@/features/Follow/hooks/useFollowListActions';
import { getProfileColor } from '@/shared/lib/profileColor';
import { FollowEntry } from '@/entities/Follow/types/followType';

type Tab = 'followers' | 'following';

const PCFollowListPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'followers';
  const [tab, setTab] = useState<Tab>(initialTab);
  const { followers, following, counts } = useFollowList();
  const { removeFollower, removeFollowing } = useFollowListActions();

  const [localFollowers, setLocalFollowers] = useState<FollowEntry[] | null>(
    null,
  );
  const [localFollowing, setLocalFollowing] = useState<FollowEntry[] | null>(
    null,
  );

  const displayedFollowers = localFollowers ?? followers;
  const displayedFollowing = localFollowing ?? following;
  const list = tab === 'followers' ? displayedFollowers : displayedFollowing;

  const handleRemove = async (uid: string) => {
    if (tab === 'followers') {
      setLocalFollowers((prev) =>
        (prev ?? followers).filter((e) => e.uid !== uid),
      );
      await removeFollower(uid);
    } else {
      setLocalFollowing((prev) =>
        (prev ?? following).filter((e) => e.uid !== uid),
      );
      await removeFollowing(uid);
    }
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
              팔로우 관리
            </h1>

            {/* 탭 */}
            <div className="mb-4 flex gap-1 rounded-sm bg-gray-100 p-1">
              {(['followers', 'following'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-sm py-2 text-sm font-bold transition-colors ${
                    tab === t
                      ? 'bg-white text-blue shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t === 'followers' ? '팔로워' : '팔로잉'}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    {t === 'followers' ? counts.followers : counts.following}
                  </span>
                </button>
              ))}
            </div>

            {/* 목록 */}
            <div className="flex flex-col gap-2">
              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-sm bg-white py-16 shadow-sm">
                  <p className="text-sm text-gray-400">
                    {tab === 'followers'
                      ? '아직 팔로워가 없습니다.'
                      : '아직 팔로잉하는 사람이 없습니다.'}
                  </p>
                </div>
              ) : (
                list.map((entry) => (
                  <div
                    key={entry.uid}
                    className="flex items-center gap-3 rounded-sm bg-white px-5 py-4 shadow-sm"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: getProfileColor(entry.name) }}
                    >
                      {entry.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-gray-800">
                      {entry.name}
                    </span>
                    <button
                      onClick={() => handleRemove(entry.uid)}
                      className="rounded-sm bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-red/10 hover:text-red"
                    >
                      {tab === 'followers' ? '삭제' : '언팔로우'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PCFollowListPage;
