/**
 * @role: features/api — 자유게시판 게시글 목록 조회
 * @rule: Firestore·Supabase 외부 데이터 호출만 담당
 */
import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import {
  collection,
  collectionGroup,
  getDocs,
  query,
  Timestamp,
} from 'firebase/firestore';

const toSeconds = (ts: Timestamp): number => {
  if (typeof ts?.seconds === 'number') return ts.seconds;
  if (typeof ts?.toMillis === 'function')
    return Math.floor(ts.toMillis() / 1000);
  return 0;
};

export const getBoardPostsApi = async (): Promise<BoardPost[]> => {
  const boardSnap = await getDocs(query(collectionGroup(db, 'board')));

  return Promise.all(
    boardSnap.docs.map(async (item) => {
      const data = item.data();
      const docId = item.id.split('/').pop() ?? item.id;

      const { data: files } = await supabase.storage
        .from('jarinare-images')
        .list(`board/${docId}`);

      let imageUrl: string | null = null;
      if (files && files.length > 0) {
        const { data: urlData } = supabase.storage
          .from('jarinare-images')
          .getPublicUrl(`board/${docId}/${files[0].name}`);
        imageUrl = urlData.publicUrl;
      }

      const commentsSnap = await getDocs(
        collection(db, 'boardComments', item.id, 'items'),
      );

      return {
        id: item.ref.path,
        author: data.author,
        content: data.content,
        title: data.title,
        views: data.views,
        likes: data.likes,
        createdAt: toSeconds(data.createdAt),
        imageUrl,
        commentCount: commentsSnap.size,
        tags: data.tags ?? [],
      } as BoardPost;
    }),
  );
};
