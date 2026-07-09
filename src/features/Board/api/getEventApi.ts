/**
 * @role: features/api — 이벤트 게시글 목록 조회
 * @rule: Firestore·Supabase 외부 데이터 호출만 담당
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import { collectionGroup, getDocs, query, Timestamp } from 'firebase/firestore';

const toSeconds = (ts: Timestamp): number => {
  if (typeof ts?.seconds === 'number') return ts.seconds;
  if (typeof ts?.toMillis === 'function')
    return Math.floor(ts.toMillis() / 1000);
  return 0;
};

export const getEventPostsApi = async (): Promise<BoardPost[]> => {
  const eventSnap = await getDocs(query(collectionGroup(db, 'event')));

  return Promise.all(
    eventSnap.docs.map(async (item) => {
      const data = item.data();

      const { data: files } = await supabase.storage
        .from('jarinare-images')
        .list(`event/${item.id}`);

      let imageUrl: string | null = null;
      if (files && files.length > 0) {
        const { data: urlData } = supabase.storage
          .from('jarinare-images')
          .getPublicUrl(`event/${item.id}/${files[0].name}`);
        imageUrl = urlData.publicUrl;
      }

      return {
        id: item.ref.path,
        author: data.author,
        content: data.content,
        title: data.title,
        views: data.views,
        likes: data.likes,
        createdAt: toSeconds(data.createdAt),
        imageUrl,
      } as BoardPost;
    }),
  );
};
