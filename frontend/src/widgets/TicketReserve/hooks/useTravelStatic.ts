import { backendClient } from '@/shared/api/backendClient';
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
        const { data } = await backendClient.get<StatItem[]>('/api/travel-stats');
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
