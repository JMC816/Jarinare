/**
 * @role: features/api — 어드민 대시보드 API
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export interface DashboardSummary {
  period: { from: string; to: string };
  reservations: {
    count: number;
    revenue: number;
    cancelCount: number;
    cancelRate: number;
  };
  users: {
    newCount: number;
    activeCount: number;
  };
  seatChanges: {
    total: number;
    acceptRate: number;
  };
  pendingReports: number;
  scheduler: {
    failures24h: number;
    staleJobs: string[];
  };
  popularRoutes: { dep: string; arr: string; count: number }[];
  popularDestinations: { destination: string; count: number }[];
}

export interface DashboardHourly {
  period: { from: string; to: string };
  hourly: { hour: number; count: number; revenue: number }[];
}

export const getDashboardSummaryApi = async (from?: string, to?: string): Promise<DashboardSummary> => {
  const res = await backendClient.get('/api/admin/dashboard/summary', { params: { from, to } });
  return res.data;
};

export const getDashboardHourlyApi = async (from?: string, to?: string): Promise<DashboardHourly> => {
  const res = await backendClient.get('/api/admin/dashboard/reservations/hourly', { params: { from, to } });
  return res.data;
};
