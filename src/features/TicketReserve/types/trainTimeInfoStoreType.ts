export type trainTimeInfoStoreType = {
  selectStartTime: number;
  selectEndTime: number;
  selectTrainType: string;
  selectKid: number;
  selectAdult: number;
  selectPay: number;
  setSelectStartTime: (type: number) => void;
  setSelectEndTime: (type: number) => void;
  setSelectTrainType: (type: string) => void;
  setSelectKid: (type: number) => void;
  setSelectAdult: (type: number) => void;
  setSelectPay: (type: number) => void;
};
