/**
 * @role: pages/TicketReturn — hooks
 * @rule: PC 반환 페이지 핸들러만 담당, UI 포함 금지
 */
import { SeatType } from '@/entities/Seat/types/seatType';
import { seatsReturnDataStore } from '@/features/TicketReturn/model/seatsReturnDataStore';
import useModalStore from '@/widgets/model/TicketReturnStore';

export const usePCTicketReturnPage = () => {
  const { setSeatsReturnData } = seatsReturnDataStore();
  const { openModal, isShow, modalType } = useModalStore();

  const handleReturnPC = (groups: SeatType[]) => {
    setSeatsReturnData(groups);
    openModal('ReturnModal');
  };

  return { handleReturnPC, isShow, modalType };
};
