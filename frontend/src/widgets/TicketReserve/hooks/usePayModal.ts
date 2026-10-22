/**
 * @role: widgets/TicketReserve — hooks
 * @rule: PayModal 상태·파생값·핸들러만 담당, UI 포함 금지
 */
import { useState, useEffect, useRef } from 'react';
import { trainDataStore } from '@/features/TicketReserve/model/trainDataStore';
import useModalStore from '../../model/ReserveStore';
import { useSeatQueryData } from '@/features/TicketReserve/hooks/useSeatQueryData';
import { useGetPoint } from '@/features/Point/hooks/useGetPoint';
import { seatsStateCountStore } from '@/features/TicketReserve/model/seatsStateCountStore';
import { useCurrentSeason } from '@/features/Season/hooks/useCurrentSeason';
import welcomeTourStore from '@/shared/models/welcomeTourStore';
import {
  PAYMENT_METHODS,
  CARD_LIST,
  type PaymentMethod,
  type CardName,
} from '../constants/payModalConstants';

export const usePayModal = () => {
  const { closeModal } = useModalStore();
  const {
    selectPay: rawSelectPay,
    selectAdult: rawSelectAdult,
    selectKid: rawSelectKid,
    endStationForView,
  } = trainDataStore();
  const { createSelectedSeats } = useSeatQueryData();
  const { point: rawPoint } = useGetPoint();
  const { seatsStateCount: rawSeatsStateCount } = seatsStateCountStore();
  const { isActive: isTourActive } = welcomeTourStore();
  const selectPay = isTourActive ? 59800 : rawSelectPay;
  const selectAdult = isTourActive ? 1 : rawSelectAdult;
  const selectKid = isTourActive ? 0 : rawSelectKid;
  const seatsStateCount = isTourActive ? selectAdult + selectKid : rawSeatsStateCount;
  const point = isTourActive ? 5000 : rawPoint;
  const { season, style, isSeasonStation } = useCurrentSeason();

  const [checked, setChecked] = useState(isTourActive);
  const [value, setValue] = useState<number | null>(isTourActive ? 3000 : null);
  const [eventSelected, setEventSelected] = useState<'none' | 'season'>('none');
  const [isEventOpen, setIsEventOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(isTourActive ? '신용카드' : null);
  const [selectedCard, setSelectedCard] = useState<CardName | null>(isTourActive ? '국민' : null);

  const isDiscountEligible = isSeasonStation(endStationForView);
  const basePrice = selectPay * seatsStateCount;
  const discountedBase =
    eventSelected === 'season' && isDiscountEligible
      ? Math.floor(basePrice * 0.9)
      : basePrice;
  const pointValue = Number(value);

  const selectedCardData = CARD_LIST.find((c) => c.name === selectedCard);
  const cardDiscount =
    selectedPaymentMethod === '신용카드' && selectedCardData
      ? Math.floor(discountedBase * selectedCardData.discount)
      : 0;

  const finalPrice = discountedBase - pointValue - cardDiscount;

  const cardPayback =
    selectedPaymentMethod === '신용카드' && selectedCardData
      ? Math.floor(finalPrice * selectedCardData.payback)
      : 0;

  const cardDiscountRate = Math.round((selectedCardData?.discount ?? 0) * 100);
  const cardPaybackRate = Math.round((selectedCardData?.payback ?? 0) * 100);

  const bannerText = selectedCardData
    ? 'note' in selectedCardData
      ? `${selectedCard}카드 ${(selectedCardData as { note: string }).note} 이벤트 적용`
      : `${selectedCard}카드 ${Math.round(selectedCardData.discount * 100)}% 할인 이벤트 적용`
    : null;

  const processedCardList = CARD_LIST.map((card) => ({
    name: card.name,
    badge: card.badge,
    color: card.color,
    bannerColor: card.bannerColor,
    note:
      'note' in card ? (card as unknown as { note: string }).note : undefined,
    noteColor:
      'noteColor' in card
        ? (card as unknown as { noteColor: string }).noteColor
        : undefined,
  }));

  useEffect(() => {
    if (!isEventOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target as Node)) {
        setIsEventOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isEventOpen]);

  const handleToggleEventDropdown = () => setIsEventOpen((prev) => !prev);
  const handleSelectEvent = (val: 'none' | 'season') => {
    setEventSelected(val);
    setIsEventOpen(false);
  };

  const handleTogglePoint = () => setChecked((prev) => !prev);
  const handleUseAllPoint = () => setValue(point);
  const handleClose = () => closeModal('PayModal');

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    if (method !== '신용카드') setSelectedCard(null);
  };

  const handleSelectCard = (name: CardName) => {
    setSelectedCard((prev) => (prev === name ? null : name));
  };

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
    await createSelectedSeats(finalPrice, checked ? pointValue : 0, cardPayback);
    closeModal('PayModal');
  };

  return {
    checked,
    value,
    eventSelected,
    isEventOpen,
    eventDropdownRef,
    handleToggleEventDropdown,
    handleSelectEvent,
    isDiscountEligible,
    basePrice,
    discountedBase,
    pointValue,
    cardDiscount,
    cardPayback,
    finalPrice,
    point,
    season,
    style,
    selectedPaymentMethod,
    selectedCard,
    selectedCardData,
    cardDiscountRate,
    cardPaybackRate,
    bannerText,
    paymentMethods: PAYMENT_METHODS,
    cardList: processedCardList,
    handleTogglePoint,
    handleUseAllPoint,
    handlePointInput,
    handleSelectPaymentMethod,
    handleSelectCard,
    handleClose,
    handlePay,
  };
};
