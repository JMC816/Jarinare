import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Value } from '../types/ReserveType';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { formatDate } from '../lib/formatDate';

export const useDaySelect = () => {
  const [value, onChange] = useState<Value>(new Date());
  const { setStartDay } = trainDataStore();
  useEffect(() => {
    setStartDay(formatDate(new Date(value!.toString())));
  }, [value]);
  return { value, onChange };
};

export const useDayCount = () => {
  const [countAdult, setCountAdult] = useState<number>(0);
  const [countKid, setCountKid] = useState<number>(0);
  const { setKid, setAdult } = trainDataStore();
  useEffect(() => {
    setKid(countKid);
    setAdult(countAdult);
  }, [countKid, countAdult]);
  return { countAdult, countKid, setCountAdult, setCountKid };
};

export const navigate = () => {
  const moveSeatCheckPage = useNavigate();
  return { moveSeatCheckPage };
};
