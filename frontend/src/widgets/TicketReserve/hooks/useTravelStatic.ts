import { db } from '@/shared/firebase/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export type StatItem = {
  destination: string;
  totalCount: number;
  byAge: Record<string, number>;
  byGender: Record<string, number>;
};

export const useTravelStatic = () => {
  const [age, setAge] = useState(false);
  const [gender, setGender] = useState(true);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const q = query(
          collection(db, 'travelStats'),
          orderBy('totalCount', 'desc'),
        );
        const snap = await getDocs(q);

        const data: StatItem[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const byAge: Record<string, number> = {};
          const byGender: Record<string, number> = {};

          Object.entries(d).forEach(([key, val]) => {
            if (key.startsWith('age_'))
              byAge[key.replace('age_', '')] = val as number;
            if (key.startsWith('gender_'))
              byGender[key.replace('gender_', '')] = val as number;
          });

          return {
            destination: d.destination,
            totalCount: d.totalCount,
            byAge,
            byGender,
          };
        });

        setStats(data);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { age, gender, setAge, setGender, stats, isLoading };
};
