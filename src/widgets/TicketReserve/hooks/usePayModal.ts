/**
 * @role: widgets/TicketReserve — hooks
 * @rule: PayModal 상태·파생값·핸들러만 담당, UI 포함 금지
 */
import { useState } from 'react';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { useUpdatePoint } from '@/features/Point/hooks/useUpdatePoint';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';
import { useSaveReserveStat } from '@/features/TicketReserve/hooks/useSaveReserveStat';
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';

export const usePayModal = () => {
  const { closeModal } = useModalStore();
  const { selectPay, endStationForView } = trainDataStore();
  const { createSelectedSeats } = useSeatQueryData();
  const { saveStat } = useSaveReserveStat();
  const { point } = useGetPoint();
  const { updatePoint } = useUpdatePoint();
  const { seatsStateCount } = seatsStateCountStore();
  const { season, style, isSeasonStation } = useCurrentSeason();

  const [checked, setChecked] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [eventSelected, setEventSelected] = useState<'none' | 'season'>('none');

  const isDiscountEligible = isSeasonStation(endStationForView);
  const basePrice = selectPay * seatsStateCount;
  const discountedBase =
    eventSelected === 'season' && isDiscountEligible
      ? Math.floor(basePrice * 0.9)
      : basePrice;
  const pointValue = Number(value);
  const finalPrice = discountedBase - pointValue;

  const handleTogglePoint = () => setChecked((prev) => !prev);
  const handleUseAllPoint = () => setValue(point);
  const handleClose = () => closeModal('PayModal');

  const handlePointInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/,/g, '');
    const numValue = inputValue === '' ? 0 : Number(inputValue);
    if (
      discountedBase &&
      (inputValue === '' || (point >= numValue && numValue >= 0))
    ) {
      setValue(numValue);
    }
  };

  const handlePay = async () => {
    await createSelectedSeats(finalPrice);
    await updatePoint(point - pointValue);
    await saveStat(endStationForView);
    closeModal('PayModal');
  };

  return {
    checked,
    value,
    eventSelected,
    setEventSelected,
    isDiscountEligible,
    basePrice,
    discountedBase,
    pointValue,
    finalPrice,
    point,
    season,
    style,
    handleTogglePoint,
    handleUseAllPoint,
    handlePointInput,
    handleClose,
    handlePay,
  };
};
