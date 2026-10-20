/**
 * @role: features/hooks
 * @rule: 좌석 변경 수락·거절만 담당. 백엔드 accept/reject API 사용
 */
import { backendClient } from '@/shared/api/backendClient';
import { pendingChangeRequestStore } from '../models/pendingChangeRequestStore';
import { isAxiosError } from 'axios';

export const useIsAcceptRequest = () => {
  const { changeRequestId, clear } = pendingChangeRequestStore();

  // 409: 이미 만료된 신청 → true 반환
  const accpetRequest = async (): Promise<boolean> => {
    if (!changeRequestId) return false;
    try {
      await backendClient.post(`/api/seats/change-requests/${changeRequestId}/accept`);
      return false;
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) return true;
      return false;
    } finally {
      clear();
    }
  };

  const refuseRequest = async () => {
    if (!changeRequestId) return;
    try {
      await backendClient.post(`/api/seats/change-requests/${changeRequestId}/reject`);
    } finally {
      clear();
    }
  };

  return { accpetRequest, refuseRequest };
};
