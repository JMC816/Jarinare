import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import { collectionGroup, getDocs, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetBoard = () => {
  const [boardData, setBoardData] = useState<BoardPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getBoard = async () => {
      const boardQuery = query(collectionGroup(db, 'board'));

      const boardSnap = await getDocs(boardQuery);

      const datas = await Promise.all(
        boardSnap.docs.map(async (item) => {
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
            .list(`board/${item.id.split('/').pop()}`);

          let imageUrl: string | null = null;

          if (files && files.length > 0) {
            const { data: urlData } = supabase.storage
              .from('jarinare-images')
              .getPublicUrl(
                `board/${item.id.split('/').pop()}/${files[0].name}`,
              );

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

      setBoardData(
        datas.filter((d) => d.title).sort((a, b) => a.createdAt - b.createdAt),
      );
      setIsLoaded(true);
    };

    getBoard();
  }, []);

  return { boardData, isLoaded };
};
