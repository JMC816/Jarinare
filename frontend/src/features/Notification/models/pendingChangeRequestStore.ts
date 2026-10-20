/**
 * @role: features/model
 * @rule: 현재 처리 중인 좌석 변경 요청 ID 저장만 담당
 */
import { create } from 'zustand';

interface PendingChangeRequestStore {
  changeRequestId: number | null;
  setChangeRequestId: (id: number | null) => void;
  clear: () => void;
}

export const pendingChangeRequestStore = create<PendingChangeRequestStore>(
  (set) => ({
    changeRequestId: null,
    setChangeRequestId: (changeRequestId) => set({ changeRequestId }),
    clear: () => set({ changeRequestId: null }),
  }),
);
