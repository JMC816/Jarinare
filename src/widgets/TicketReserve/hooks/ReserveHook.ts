import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Value } from '../types/ReserveType';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import {
  formatDate,
  formatDateForView,
  formatStartDate,
} from '../lib/formatDate';
import { trainQueryData } from '@/features/TicketReserve/hooks/trainQueryData';

export const useDaySelect = () => {
  const [value, onChange] = useState<Value>(new Date());
  const { setStartDay, setStartDayForView } = trainDataStore();
  useEffect(() => {
    setStartDay(formatDate(new Date(Number(value))));
    setStartDayForView(formatDateForView(new Date(Number(value))));
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

export const useDayHandle = () => {
  const { setStartDay, setStartDayForView, startDay } = trainDataStore();
  const [day, setDay] = useState(formatStartDate(startDay));
  const { refetch } = trainQueryData();
  // 어제 날짜
  const handleYesterday = () => {
    const today = new Date();
    const prevDate = new Date(day);

    // 금일보다 이전 날짜는 보여주지 않는다.
    if (day > today) {
      prevDate.setDate(day.getDate() - 1);
      setDay(prevDate);
      setStartDay(formatDate(prevDate));
      setStartDayForView(formatDateForView(prevDate));
    }
  };
  // 내일 날짜
  const handleTomorrow = () => {
    // 쿼리에 들어가는 상태(날짜)를 바꾼 후 refetch로 기차 시간 목록 업데이트
    const prevDate = new Date(day);
    prevDate.setDate(day.getDate() + 1);
    setDay(prevDate);
    setStartDay(formatDate(prevDate));
    setStartDayForView(formatDateForView(prevDate));
  };

  // 날짜가 바뀔 때 마다 refetch로 기차 시간 목록 업데이트
  useEffect(() => {
    refetch();
  }, [startDay]);

  return { day, handleYesterday, handleTomorrow };
};

export const useRefetchByStartTime = () => {
  const { startTime } = trainDataStore();
  const { refetch } = trainQueryData();
  useEffect(() => {
    refetch();
  }, [startTime]);
};

export const useMaxDate = () => {
  const date = new Date();
  const maxDate = new Date(date.setDate(new Date().getDate() + 6));
  return { maxDate };
};
