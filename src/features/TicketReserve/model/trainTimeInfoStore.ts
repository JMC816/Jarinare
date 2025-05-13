import { create } from 'zustand';
import { trainTimeInfoStoreType } from '../types/trainTimeInfoStoreType';

export const trainTimeInfoStore = create<trainTimeInfoStoreType>((set) => ({
  selectStartTime: 0,
  selectEndTime: 0,
  selectTrainType: '',
  selectKid: 0,
  selectAdult: 0,
  selectPay: 0,
  setSelectStartTime: (selectStartTime: number) =>
    set(() => ({ selectStartTime })),
  setSelectEndTime: (selectEndTime: number) => set(() => ({ selectEndTime })),
  setSelectTrainType: (selectTrainType: string) =>
    set(() => ({ selectTrainType })),
  setSelectKid: (selectKid: number) => set(() => ({ selectKid })),
  setSelectAdult: (selectAdult: number) => set(() => ({ selectAdult })),
  setSelectPay: (selectPay: number) => set(() => ({ selectPay })),
}));
