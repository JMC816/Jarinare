/**
 * @role: features — 팔로워/팔로잉 목록 조회
 * @rule: Firestore 읽기만 담당, UI 포함 금지
 */
import { auth, db } from '@/shared/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FollowEntry } from '@/entities/Follow/types/followType';

export const useFollowList = (targetUid?: string) => {
  const [followers, setFollowers] = useState<FollowEntry[]>([]);
  const [following, setFollowing] = useState<FollowEntry[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const uid = targetUid ?? auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const fetchAll = async () => {
      const [followerSnap, followingSnap] = await Promise.all([
        getDocs(collection(db, 'follows', uid, 'followers')),
        getDocs(collection(db, 'follows', uid, 'following')),
      ]);

      const followerList: FollowEntry[] = followerSnap.docs.map((d) => ({
        uid: d.id,
        name: d.data().name as string,
        followedAt: d.data().followedAt as number,
      }));

      const followingList: FollowEntry[] = followingSnap.docs.map((d) => ({
        uid: d.id,
        name: d.data().name as string,
        followedAt: d.data().followedAt as number,
      }));

      setFollowers(followerList);
      setFollowing(followingList);
      setCounts({
        followers: followerList.length,
        following: followingList.length,
      });
    };

    fetchAll();
  }, [uid]);

  return { followers, following, counts };
};
