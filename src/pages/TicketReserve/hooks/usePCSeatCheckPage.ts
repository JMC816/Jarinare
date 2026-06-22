/**
 * @role: pages/TicketReserve — hooks
 * @rule: PCSeatCheckPage 상태·로직만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import { seatsStateStore } from '@/features/TicketReserve/model/seatsStateStore';
import { reserveConstants } from '@/widgets/TicketReserve/constants/ReserveConstants';
import useModalStore from '@/widgets/model/ReserveStore';
import { auth } from '@/shared/firebase/firebase';
import { useResetSeatsState } from '@/features/TicketReserve/hooks/useResetSeatsState';
import { SEATS_PER_CAR } from '../constants/PCTrainCheckConstants';

const TOTAL_SEATS = SEATS_PER_CAR;

const getCongestion = (reserved: number) => {
  const ratio = reserved / TOTAL_SEATS;
  if (ratio === 0) return { label: '여유', bg: '#dcfce7', color: '#16a34a' };
  if (ratio < 0.3) return { label: '여유', bg: '#dcfce7', color: '#16a34a' };
  if (ratio < 0.7) return { label: '보통', bg: '#fef9c3', color: '#ca8a04' };
  return { label: '혼잡', bg: '#fee2e2', color: '#ef4444' };
};

export const usePCSeatCheckPage = () => {
  const {
    handleSingleSelect,
    handleAllSelect,
    seatsInfo,
    locks,
    isLocksLoaded,
    seatsStateCount,
  } = useSeatQueryData();
  const {
    selectTrainType,
    startStationForView,
    endStationForView,
    selectKid,
    selectAdult,
    trainNo,
    setTrainNo,
  } = trainDataStore();
  const { seatsState } = seatsStateStore();
  const { openModal } = useModalStore();
  const { seatsRows, trainNoArray } = reserveConstants();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const trainNoSeatsCount = seatsInfo.filter(
    (item) => item.trainNoId === trainNo,
  ).length;

  useResetSeatsState();

  const [isTrainDropdownOpen, setIsTrainDropdownOpen] = useState(false);

  const trainNoArrayWithCongestion = trainNoArray.map(
    ({ trainNo: no, trainNoView }) => ({
      trainNo: no,
      trainNoView,
      reserved: Number(trainNoView),
      ...getCongestion(Number(trainNoView)),
    }),
  );

  const handleToggleTrainDropdown = () =>
    setIsTrainDropdownOpen((prev) => !prev);
  const handleCloseTrainDropdown = () => setIsTrainDropdownOpen(false);
  const handleSelectTrainNo = (no: string) => {
    setTrainNo(no);
    setIsTrainDropdownOpen(false);
  };

  const isAllSelected =
    seatsStateCount === 0 ? false : seatsStateCount === selectKid + selectAdult;
  const isAllLocked =
    seatsStateCount === 0 ? false : seatsStateCount <= selectKid + selectAdult;

  return {
    handleSingleSelect,
    handleAllSelect,
    seatsInfo,
    locks,
    isLocksLoaded,
    seatsStateCount,
    selectTrainType,
    startStationForView,
    endStationForView,
    selectKid,
    selectAdult,
    trainNo,
    seatsState,
    openModal,
    seatsRows,
    navigate,
    user,
    isAllSelected,
    isAllLocked,
    isTrainDropdownOpen,
    trainNoArrayWithCongestion,
    handleToggleTrainDropdown,
    handleCloseTrainDropdown,
    handleSelectTrainNo,
    trainNoSeatsCount,
  };
};
