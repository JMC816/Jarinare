/**
 * @role: pages/History — 결제/포인트 내역 필터·상태 관리
 * @rule: 상태·필터 로직만 담당, 렌더링 포함 금지
 */
import { useState, useMemo } from 'react';
import { useGetPayment } from '@/features/Point/hooks/useGetPayment';
import { useGetOrders } from '@/features/Point/hooks/useGetOrders';

export type Tab = 'payment' | 'point';
export type PeriodMode = 'all' | '1month' | '3month' | 'custom';
export type PaymentTypeMode = 'all' | 'purchase' | 'return';
export type PointTypeMode = 'all' | 'earn' | 'spend';
export type TypeMode = PaymentTypeMode | PointTypeMode;
export type SortMode = 'newest' | 'oldest';

const dateKey = (ts: number) => {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const dateLabel = (ts: number) => {
  const d = new Date(ts * 1000);
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getDate()}일 (${week[d.getDay()]})`;
};

export function groupByDate<T extends { createAt: number }>(items: T[], sort: SortMode): { date: string; label: string; items: T[] }[] {
  const map = new Map<string, { label: string; items: T[] }>();
  for (const item of items) {
    const key = dateKey(item.createAt);
    if (!map.has(key)) map.set(key, { label: dateLabel(item.createAt), items: [] });
    map.get(key)!.items.push(item);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => sort === 'newest' ? b.localeCompare(a) : a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));
}

export const useHistoryFilter = () => {
  const { payment: pointHistory } = useGetPayment();
  const { orders } = useGetOrders();

  const today = new Date();
  const [tab, setTab] = useState<Tab>('payment');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [filterOpen, setFilterOpen] = useState(false);

  const [draftPeriod, setDraftPeriod] = useState<PeriodMode>('all');
  const [draftType, setDraftType] = useState<TypeMode>('all');
  const [draftSort, setDraftSort] = useState<SortMode>('newest');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [appliedPeriod, setAppliedPeriod] = useState<PeriodMode>('all');
  const [appliedType, setAppliedType] = useState<TypeMode>('all');
  const [appliedSort, setAppliedSort] = useState<SortMode>('newest');
  const [appliedRange, setAppliedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const isFiltered = appliedPeriod !== 'all' || appliedType !== 'all' || appliedSort !== 'newest';

  const switchTab = (t: Tab) => {
    setTab(t);
    setAppliedType('all');
    setDraftType('all');
  };

  const goPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const goNext = () => {
    if (isCurrentMonth) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const openFilter = () => {
    setDraftPeriod(appliedPeriod);
    setDraftType(appliedType);
    setDraftSort(appliedSort);
    setFilterOpen(true);
  };

  const handleApply = () => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (draftPeriod === '1month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else if (draftPeriod === '3month') {
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    } else if (draftPeriod === 'custom') {
      start = customStart ? new Date(customStart) : null;
      end = customEnd ? new Date(customEnd + 'T23:59:59') : null;
    } else {
      start = null; end = null;
    }

    setAppliedRange({ start, end });
    setAppliedPeriod(draftPeriod);
    setAppliedType(draftType);
    setAppliedSort(draftSort);
    setFilterOpen(false);
  };

  const applyPeriodFilter = <T extends { createAt: number }>(items: T[]) => {
    if (appliedPeriod === 'all') {
      return items.filter(item => {
        const d = new Date(item.createAt * 1000);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
    }
    return items.filter(item => {
      const d = new Date(item.createAt * 1000);
      if (appliedRange.start && d < appliedRange.start) return false;
      if (appliedRange.end && d > appliedRange.end) return false;
      return true;
    });
  };

  const filteredOrders = useMemo(() => {
    let result = applyPeriodFilter(orders);
    if (appliedType === 'purchase') result = result.filter(o => !o.isReturn);
    if (appliedType === 'return') result = result.filter(o => o.isReturn);
    return result;
  }, [orders, year, month, appliedPeriod, appliedRange, appliedType]);

  const filteredPoints = useMemo(() => {
    let result = applyPeriodFilter(pointHistory);
    if (appliedType === 'earn') result = result.filter(p => p.accruedPoint > 0);
    if (appliedType === 'spend') result = result.filter(p => p.accruedPoint < 0);
    return result;
  }, [pointHistory, year, month, appliedPeriod, appliedRange, appliedType]);

  const groupedOrders = useMemo(() => groupByDate(filteredOrders, appliedSort), [filteredOrders, appliedSort]);
  const groupedPoints = useMemo(() => groupByDate(filteredPoints, appliedSort), [filteredPoints, appliedSort]);

  const periodLabel = appliedPeriod === 'all' ? '전체' : appliedPeriod === '1month' ? '1개월' : appliedPeriod === '3month' ? '3개월' : '직접';

  const typeLabel = appliedType === 'all' ? '전체'
    : appliedType === 'purchase' ? '구매'
    : appliedType === 'return' ? '반환'
    : appliedType === 'earn' ? '적립'
    : '사용';

  return {
    tab, switchTab,
    year, month, goPrev, goNext,
    filterOpen, setFilterOpen, openFilter,
    draftPeriod, setDraftPeriod,
    draftType, setDraftType,
    draftSort, setDraftSort,
    customStart, setCustomStart,
    customEnd, setCustomEnd,
    appliedPeriod, appliedSort,
    isCurrentMonth, isFiltered,
    groupedOrders, groupedPoints,
    periodLabel, typeLabel,
    handleApply,
  };
};
