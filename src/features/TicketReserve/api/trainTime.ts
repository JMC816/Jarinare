import { instance } from './train';

// 기차역별 시간 목록
export const getTimeByStation = async (
  startStation: string,
  endStation: string,
  startDay: string,
  trainType?: string,
) => {
  const { data } = await instance.get('/getStrtpntAlocFndTrainInfo', {
    params: {
      pageNo: '1',
      numOfRows: '200',
      depPlaceId: startStation,
      arrPlaceId: endStation,
      depPlandTime: startDay,
      trainGradeCode: trainType,
    },
  });

  const item = data.response.body.items.item;
  if (!item) return [];
  // 값 중 배열이 아닌 경우 배열로 감싸서 반환
  return Array.isArray(item) ? item : [item];
};
