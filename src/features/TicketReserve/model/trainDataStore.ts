import { create } from 'zustand';
import { TrainDataStoreType } from '../types/TrainDataStoreType';

export const trainDataStore = create<TrainDataStoreType>((set) => ({
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
}));
