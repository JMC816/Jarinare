import { useEffect } from 'react';
import { seatsStateStore } from '../model/seatsStateStore';
import { trainDataStore } from '../model/trainDataStore';

export const useResetSeatsState = () => {
  const { trainNo } = trainDataStore();
  const { setSeatsState } = seatsStateStore();

  useEffect(() => {
    setSeatsState({});
  }, [trainNo]);
};
