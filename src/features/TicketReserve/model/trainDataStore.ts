import { TrainDataStoreType } from './../types/trainDataStoreType';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 리렌더링 발생 시 상태 유지
// sessionStorage에 상태 저장
export const trainDataStore = create(
  persist<TrainDataStoreType>(
    (set) => ({
      startDay: '',
      endDay: '',
      startTime: '',
      endTime: '',
      pay: '',
      trainType: '',
      startStation: '',
      endStation: '',
      kid: 0,
      adult: 0,
      startStationForView: '',
      endStationForView: '',
      startDayForView: '',
      trainTypeForView: '',
      startTimeForView: '',
      setStartDay: (startDay: string) => set(() => ({ startDay })),
      setEndDay: (endDay: string) => set(() => ({ endDay })),
      setStartTime: (startTime: string) => set(() => ({ startTime })),
      setEndTime: (endTime: string) => set(() => ({ endTime })),
      setPay: (pay: string) => set(() => ({ pay })),
      setTrainType: (trainType: string) => set(() => ({ trainType })),
      setStartStation: (startStation: string) => set(() => ({ startStation })),
      setEndStation: (endStation: string) => set(() => ({ endStation })),
      setKid: (kid: number) => set(() => ({ kid })),
      setAdult: (adult: number) => set(() => ({ adult })),
      setStartStationForView: (startStationForView: string) =>
        set(() => ({ startStationForView })),
      setEndStationForView: (endStationForView: string) =>
        set(() => ({ endStationForView })),
      setStartDayForView: (startDayForView: string) =>
        set(() => ({ startDayForView })),
      setTrainTypeForView: (trainTypeForView: string) =>
        set(() => ({ trainTypeForView })),
      setStartTimeForView: (startTimeForView: string) =>
        set(() => ({ startTimeForView })),
    }),
    {
      name: 'trainTiem-storage',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
