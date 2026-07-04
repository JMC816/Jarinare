/**
 * @role: pages — 팔로우/팔로워 목록 페이지 (PC/모바일 분기)
 * @rule: PC/모바일 분기만 담당
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BackWardPageButton from '@/widgets/layouts/ui/BackWardPageButton';
import { useFollowList } from '@/features/Follow/hooks/useFollowList';
import { useFollowListActions } from '@/features/Follow/hooks/useFollowListActions';
import { getProfileColor } from '@/shared/lib/profileColor';
import { FollowEntry } from '@/entities/Follow/types/followType';
import PCFollowListPage from './PCFollowListPage';

type Tab = 'followers' | 'following';

const FollowListPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'followers';
  const [tab, setTab] = useState<Tab>(initialTab);
  const { followers, following } = useFollowList();
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
    <>
      {/* PC 버전 */}
      <div className="hidden w-full lg:block">
        <PCFollowListPage />
      </div>

      {/* 모바일 버전 */}
      <div className="flex min-h-screen w-full flex-col bg-gray-100 lg:hidden">
        <div className="px-[28px]">
          <BackWardPageButton title="팔로우 관리" />
        </div>

        {/* 탭 */}
        <div className="mx-[18px] mt-4 flex gap-1 rounded-sm bg-white p-1 shadow-sm">
          {(['followers', 'following'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-sm py-2 text-sm font-bold transition-colors ${
                tab === t ? 'bg-lightBlue text-blue' : 'text-gray-400'
              }`}
            >
              {t === 'followers' ? '팔로워' : '팔로잉'}
              <span className="ml-1 text-xs font-normal text-gray-400">
                {t === 'followers'
                  ? displayedFollowers.length
                  : displayedFollowing.length}
              </span>
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="mt-3 flex flex-col gap-2 px-[18px] pb-[100px]">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-sm bg-white py-16">
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
                className="flex items-center gap-3 rounded-sm bg-white px-4 py-3 shadow-sm"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
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
                  {tab === 'followers' ? 'x' : '팔로우 취소'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default FollowListPage;
