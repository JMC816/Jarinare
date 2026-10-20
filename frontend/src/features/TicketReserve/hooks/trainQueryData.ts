import { useQuery } from '@tanstack/react-query';
import { QueryDataProps, TrainTimeProps } from '../types/stationType';
import { trainDataStore } from '../model/trainDataStore';
import { fetchAllStations } from '../api/station';
import { getTimeByStation } from '../api/trainTime';
import welcomeTourStore from '@/shared/models/welcomeTourStore';

const generateDemoTrains = (): TrainTimeProps => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const base = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return [
    { adultcharge: 59800, arrplacename: '부산', arrplandtime: Number(`${base}103000`), depplacename: '서울', depplandtime: Number(`${base}080000`), traingradename: 'KTX', trainno: 1 },
    { adultcharge: 0,     arrplacename: '부산', arrplandtime: Number(`${base}163000`), depplacename: '서울', depplandtime: Number(`${base}133000`), traingradename: 'KTX', trainno: 103 },
    { adultcharge: 42500, arrplacename: '부산', arrplandtime: Number(`${base}212000`), depplacename: '서울', depplandtime: Number(`${base}183000`), traingradename: 'ITX-마음', trainno: 1021 },
  ];
};

export const trainQueryData = (): QueryDataProps => {
  const { isActive } = welcomeTourStore();
  const { startStation, endStation, startDay, trainType } = trainDataStore();

  // 역 정보 조회
  const stationQuery = useQuery({
    queryKey: ['station'],
    queryFn: fetchAllStations,
    gcTime: 24 * 60 * 60 * 1000, // 24시간 캐시
    staleTime: 12 * 60 * 60 * 1000, // 12시간 동안 fresh 상태 유지
    refetchOnWindowFocus: false, // 창을 다시 포커스해도 자동 호출 방지
  });

  // 기차 시간 조회
  const trainTimeQuery = useQuery({
    queryKey: ['trainTime', startStation, endStation, startDay, trainType],
    queryFn: () =>
      getTimeByStation(
        startStation,
        endStation,
        startDay,
        trainType || undefined,
      ),
    // 필수 파라미터가 있을 때만 자동 실행 (투어 모드 제외)
    enabled: !isActive && !!(
      startStation &&
      endStation &&
      startDay &&
      startStation !== endStation
    ),
    gcTime: 10 * 60 * 1000, // 10분 캐시 (짧게)
    staleTime: 0, // 즉시 stale 상태로 만들어 항상 refetch 가능
    refetchOnWindowFocus: false, // 창을 다시 포커스해도 자동 호출 방지
    refetchOnMount: true, // 마운트 시 refetch 허용
    refetchOnReconnect: false, // 네트워크 재얀결 시 자동 호출 방지
    retry: 1, // 실패 시 1회 재시도
    retryDelay: 3000, // 재시도 전 3초 대기
  });

  if (isActive) {
    return {
      stations: stationQuery.data || [],
      trainTime: generateDemoTrains(),
      isLoading: false,
      isFetching: false,
      refetch: () => {},
    };
  }

  return {
    stations: stationQuery.data || [],
    trainTime: trainTimeQuery.data || [],
    isLoading: stationQuery.isLoading,
    isFetching: trainTimeQuery.isFetching,
    refetch: trainTimeQuery.refetch,
  };
};
