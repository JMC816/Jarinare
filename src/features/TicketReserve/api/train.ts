import { SERVICE_KEY, TRAIN_URL } from '@/shared/Train/TrainConfig';
import axios from 'axios';
import pLimit from 'p-limit';
import { StationProps } from '../types/stationType';
import { areaCode } from '../constants/areaCode';

const instance = axios.create({
  baseURL: TRAIN_URL,
  headers: { 'Content-Type': 'application/json' },
  params: { serviceKey: SERVICE_KEY, _type: 'json' },
});

const getStationsByCity = async (cityCode: string) => {
  const { data } = await instance.get('/getCtyAcctoTrainSttnList', {
    params: { cityCode: cityCode, pageNo: 1, numOfRows: 57 },
  });
  return data.response.body.items.item;
};

export const fetchAllStations = async () => {
  const limit = pLimit(10); // 동시 요청 제한
  const tasks = areaCode.map((code) => limit(() => getStationsByCity(code)));
  // 성공/실패 상관없이 모든 promise 값 반환
  const results = await Promise.allSettled(tasks);
  // 성공한 값만 배열로 반환
  const stations = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => (r as PromiseFulfilledResult<StationProps>).value);
  return stations;
};
