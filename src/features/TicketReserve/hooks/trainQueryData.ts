import { useQueries } from '@tanstack/react-query';
import { QueryDataProps } from '../types/stationType';
import { trainDataStore } from '../model/trainDataStore';
import { fetchAllStations } from '../api/station';
import { getTimeByStation } from '../api/trainTime';

export const trainQueryData = (): QueryDataProps => {
  const { startStation, endStation, startDay, trainType } = trainDataStore();
  const results = useQueries({
    queries: [
      {
        queryKey: ['station'],
        queryFn: fetchAllStations,
        gcTime: 24 * 60 * 60 * 1000,
      },
      {
        queryKey: ['trainTime'],
        queryFn: () =>
          getTimeByStation(
            startStation,
            endStation,
            startDay,
            trainType || undefined,
          ),
        enabled: false,
      },
    ],
  });
  const stationQuery = results[0];
  const trainTimeQuery = results[1];
  return {
    stations: stationQuery.data || [],
    trainTime: trainTimeQuery.data || [],
    isLoading: stationQuery.isLoading,
    isFetching: trainTimeQuery.isFetching,
    refetch: trainTimeQuery.refetch,
  };
};
