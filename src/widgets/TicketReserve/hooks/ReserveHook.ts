import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Value } from '../types/ReserveType';

export const useDaySelect = () => {
  const [value, onChange] = useState<Value>(new Date());
  return { value, onChange };
};

export const useDayCount = () => {
  const [countAdult, setCountAdult] = useState<number>(0);
  const [countKid, setCountKid] = useState<number>(0);
  return { countAdult, countKid, setCountAdult, setCountKid };
};

export const navigate = () => {
  const moveSeatCheckPage = useNavigate();
  return { moveSeatCheckPage };
};
