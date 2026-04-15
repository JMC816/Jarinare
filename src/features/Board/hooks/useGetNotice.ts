import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import { collectionGroup, getDocs, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetNotice = () => {
  const [noticeData, setNoticeData] = useState<BoardPost[]>([]);

  useEffect(() => {
    const getNotice = async () => {
      const noticeQuery = query(collectionGroup(db, 'notice'));

      const noticeSnap = await getDocs(noticeQuery);

      const datas = await Promise.all(
        noticeSnap.docs.map(async (item) => {
          const data = item.data();
          const ts: Timestamp = data.createdAt;

          const createdAtSeconds =
            typeof ts?.seconds === 'number'
              ? ts.seconds
              : typeof ts?.toMillis === 'function'
                ? Math.floor(ts.toMillis() / 1000)
                : 0;

          const { data: files } = await supabase.storage
            .from('jarinare-images')
            .list(`notice/${item.id}`);

          let imageUrl: string | null = null;

          if (files && files.length > 0) {
            const { data: urlData } = supabase.storage
              .from('jarinare-images')
              .getPublicUrl(`notice/${item.id}/${files[0].name}`);

            imageUrl = urlData.publicUrl;
          }

          return {
            id: item.ref.path,
            author: data.author,
            content: data.content,
            title: data.title,
            views: data.views,
            likes: data.likes,
            createdAt: createdAtSeconds,
            imageUrl,
          } as BoardPost;
        }),
      );

      setNoticeData(
        datas.filter((d) => d.title).sort((a, b) => a.createdAt - b.createdAt),
      );
    };

    getNotice();
  }, []);

  return { noticeData };
};
