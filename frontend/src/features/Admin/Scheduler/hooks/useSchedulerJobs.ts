/**
 * @role: features/hooks — 스케줄러 잡 목록 조회 (실행 중이면 5초 폴링)
 * @rule: api/ 호출만 담당
 */
import { useEffect, useRef, useState } from 'react';
import { getSchedulerJobsApi, JobInfo } from '../api/schedulerAdminApi';

export const useSchedulerJobs = () => {
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = async () => {
    try {
      const data = await getSchedulerJobsApi();
      setJobs(data);
    } catch (e) {
      console.error('[useSchedulerJobs]', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetch().finally(() => setIsLoading(false));
  }, []);

  // 실행 중(RUNNING/PENDING) 잡이 있으면 5초 폴링
  useEffect(() => {
    const hasActive = jobs.some(
      (j) => j.lastStatus === 'RUNNING' || j.lastStatus === 'PENDING',
    );
    if (hasActive) {
      intervalRef.current = setInterval(fetch, 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobs]);

  return { jobs, isLoading, refetch: fetch };
};
