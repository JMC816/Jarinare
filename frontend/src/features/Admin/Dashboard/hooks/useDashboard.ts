/**
 * @role: features/hooks — 대시보드 요약·시간대별 데이터 조회
 * @rule: api/ 호출·상태 관리만 담당
 */
import { useEffect, useState } from 'react';
import { getDashboardSummaryApi, getDashboardHourlyApi, DashboardSummary, DashboardHourly } from '../api/dashboardAdminApi';

export type Period = 'today' | 'week';

function getDateRange(period: Period): { from?: string; to?: string } {
  if (period === 'today') return {};

  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const dow = kstNow.getUTCDay();
  const diff = dow === 0 ? 6 : dow - 1;
  const monday = new Date(kstNow.getTime() - diff * 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  return { from: fmt(monday), to: fmt(kstNow) };
}

export const useDashboard = () => {
  const [period, setPeriod] = useState<Period>('today');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [hourly, setHourly] = useState<DashboardHourly | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch = async (p: Period) => {
    setIsLoading(true);
    try {
      const { from, to } = getDateRange(p);
      const [s, h] = await Promise.all([getDashboardSummaryApi(from, to), getDashboardHourlyApi(from, to)]);
      setSummary(s);
      setHourly(h);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('[useDashboard]', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetch('today'); }, []);

  const changePeriod = (p: Period) => {
    setPeriod(p);
    fetch(p);
  };

  return { summary, hourly, isLoading, lastUpdated, period, changePeriod, refetch: () => fetch(period) };
};
