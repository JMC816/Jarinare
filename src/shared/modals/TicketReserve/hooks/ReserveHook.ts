import { useState } from 'react';
import { Value } from '../types/Reserve';
import { useNavigate } from 'react-router-dom';

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
