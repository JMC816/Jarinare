/**
 * @role: pages — PC 내 승차권 페이지 상태 훅
 * @rule: 상태만 담당
 */
import { useEffect } from 'react';
import { useTicketLists } from '@/features/TicketList/hooks/useTicketLists';
import {
  clearAllSeatsCache,
  prefetchAllSeats,
} from '@/features/TicketReserve/hooks/useAllSeatsInfo';
import { auth } from '@/shared/firebase/firebase';

export const usePCTicketListPage = () => {
  const { groupedArray } = useTicketLists() ?? {};
  const isEmpty = !groupedArray || groupedArray.length === 0;
  const isLoggedIn = !!auth.currentUser;

  useEffect(() => {
    clearAllSeatsCache();
    prefetchAllSeats();
  }, []);

  return { isEmpty, isLoggedIn };
};
