/**
 * @role: widgets/hooks
 * @rule: pendingChangeRequestStore 감시 후 ResponseModal 오픈만 담당
 */
import { useEffect, useRef } from 'react';
import { pendingChangeRequestStore } from '@/features/Notification/models/pendingChangeRequestStore';
import useModalStore from '@/widgets/model/Notification';

export const usePendingChangeRequestModal = () => {
  const { changeRequestId } = pendingChangeRequestStore();
  const { openModal } = useModalStore();
  const prevId = useRef<number | null>(null);

  useEffect(() => {
    if (changeRequestId !== null && changeRequestId !== prevId.current) {
      prevId.current = changeRequestId;
      openModal('ResponseModal');
    }
    if (changeRequestId === null) {
      prevId.current = null;
    }
  }, [changeRequestId, openModal]);
};
