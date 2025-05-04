import { useQueries } from '@tanstack/react-query';
import { QueryDataProps } from '../types/stationType';
import { fetchAllStations } from '../api/train';

export const trainQueryData = (): QueryDataProps => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['station'],
        queryFn: fetchAllStations,
        staleTime: 1000000,
        gcTime: 24 * 60 * 60 * 1000,
      },
    ],
  });
  const stationQuery = results[0];

  return {
    stations: stationQuery.data || [],
    isLoading: stationQuery.isLoading,
  };
};
