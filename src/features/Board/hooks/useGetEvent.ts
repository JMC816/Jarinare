import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import supabase from '@/shared/supabase/supabase';
import { collectionGroup, getDocs, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetDvent = () => {
  const [eventDat, setEventData] = useState<BoardPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getEvent = async () => {
      const eventQuery = query(collectionGroup(db, 'event'));

      const eventSnap = await getDocs(eventQuery);

      const datas = await Promise.all(
        eventSnap.docs.map(async (item) => {
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
            createdAt: createdAtSeconds,
            imageUrl,
          } as BoardPost;
        }),
      );

      setEventData(
        datas.filter((d) => d.title).sort((a, b) => a.createdAt - b.createdAt),
      );
      setIsLoaded(true);
    };

    getEvent();
  }, []);

  return { eventDat, isLoaded };
};
