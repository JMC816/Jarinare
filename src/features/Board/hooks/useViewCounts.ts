import { BoardPost } from '@/entities/Board/types/boardType';
import { db } from '@/shared/firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';

export const useViewCounts = (items: BoardPost[]) => {
  const [viewsMap, setViewsMap] = useState<Record<string, number>>({});
  const listenersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    listenersRef.current.forEach((unsub) => unsub());
    listenersRef.current = [];

    const unsubscribes = items.map((item) => {
      const docId = item.id.split('/').pop() ?? '';
      return onSnapshot(doc(db, 'boardViews', docId), (snap) => {
        const count = snap.data()?.count ?? 0;
        setViewsMap((prev) => ({ ...prev, [item.id]: count }));
      });
    });

    listenersRef.current = unsubscribes;
    return () => unsubscribes.forEach((unsub) => unsub());
  }, [items.length]);

  return { viewsMap };
};
