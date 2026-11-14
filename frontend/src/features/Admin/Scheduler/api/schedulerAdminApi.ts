/**
 * @role: features/api — 어드민 스케줄러 API
 * @rule: backendClient 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';

export interface JobInfo {
  name: string;
  cron: string;
  description: string;
  nextRunAt: string | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
  lastRunAt: string | null;
  isActive: boolean;
}

export interface RunLog {
  runId: string;
  jobName: string;
  status: string;
  startYmd: string;
  endYmd: string;
  startedAt: string;
  endedAt: string | null;
  errorMessage: string | null;
  metadata: unknown;
  triggeredBy: string | null;
  params: unknown;
}

export interface RunJobParams {
  startDate?: string;
  endDate?: string;
  days?: number;
}

export interface DashboardScheduler {
  failures24h: number;
  staleJobs: string[];
}

export const getSchedulerJobsApi = async (): Promise<JobInfo[]> => {
  const res = await backendClient.get<JobInfo[]>('/api/admin/scheduler/jobs');
  return res.data;
};

export const runJobApi = async (name: string, params?: RunJobParams) => {
  const res = await backendClient.post(`/api/admin/scheduler/jobs/${name}/run`, params ?? {});
  return res.data as { runId: string; jobName: string; status: string };
};

export const getSchedulerRunsApi = async (query: {
  limit?: number;
  jobName?: string;
  status?: string;
}): Promise<RunLog[]> => {
  const res = await backendClient.get<RunLog[]>('/api/admin/scheduler/runs', { params: query });
  return res.data;
};

export const cancelRunApi = async (runId: string) => {
  const res = await backendClient.post(`/api/admin/scheduler/runs/${runId}/cancel`);
  return res.data as { runId: string; cancelled: boolean };
};

export const retryRunApi = async (runId: string) => {
  const res = await backendClient.post(`/api/admin/scheduler/runs/${runId}/retry`);
  return res.data as { runId: string; jobName: string; status: string };
};

export const updateJobSettingApi = async (name: string, isActive: boolean) => {
  const res = await backendClient.patch(`/api/admin/scheduler/settings/${name}`, { isActive });
  return res.data;
};

export const getDashboardSummaryApi = async () => {
  const res = await backendClient.get('/api/admin/dashboard/summary');
  return res.data as { scheduler: DashboardScheduler };
};
