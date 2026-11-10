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
import welcomeTourStore from '@/shared/models/welcomeTourStore';
import {
  PAYMENT_METHODS,
  CARD_LIST,
  type PaymentMethod,
  type CardName,
} from '../constants/payModalConstants';
import { fetchPricePreview, type PricePreviewResult } from '@/features/TicketReserve/api/reservationApi';

export const usePayModal = () => {
  const { closeModal } = useModalStore();
  const {
    selectAdult: rawSelectAdult,
    selectKid: rawSelectKid,
    tripId,
  } = trainDataStore();
  const { createSelectedSeats } = useSeatQueryData();
  const { point: rawPoint } = useGetPoint();
  const { seatsStateCount: rawSeatsStateCount } = seatsStateCountStore();
  const { isActive: isTourActive } = welcomeTourStore();

  const selectAdult = isTourActive ? 1 : rawSelectAdult;
  const selectKid = isTourActive ? 0 : rawSelectKid;
  const seatsStateCount = isTourActive ? selectAdult + selectKid : rawSeatsStateCount;
  const point = isTourActive ? 5000 : rawPoint;

  const [checked, setChecked] = useState(isTourActive);
  const [value, setValue] = useState<number | null>(isTourActive ? 3000 : null);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(isTourActive ? '신용카드' : null);
  const [selectedCard, setSelectedCard] = useState<CardName | null>(isTourActive ? '국민' : null);

  const [preview, setPreview] = useState<PricePreviewResult | null>(null);

  const pointValue = Number(value);
  const usedPointForPreview = checked ? pointValue : 0;

  // 카드·포인트 변경 시 서버에서 금액 미리보기
  useEffect(() => {
    if (isTourActive || !tripId) return;
    fetchPricePreview({
      tripId,
      seatCount: seatsStateCount,
      paymentMethod: selectedPaymentMethod,
      selectedCard: selectedPaymentMethod === '신용카드' ? selectedCard : null,
      usedPoint: usedPointForPreview,
    })
      .then(setPreview)
      .catch(() => {});
  }, [tripId, seatsStateCount, selectedCard, selectedPaymentMethod, usedPointForPreview, isTourActive]);

  // 투어 모드 미리보기 고정값
  const tourPreview: PricePreviewResult = {
    basePrice: 59800,
    seasonDiscountApplied: false,
    cardDiscountAmount: Math.floor(59800 * 0.05),
    usedPoint: 3000,
    finalPrice: 59800 - Math.floor(59800 * 0.05) - 3000,
    paybackPoint: Math.floor((59800 - Math.floor(59800 * 0.05) - 3000) * 0.03),
  };

  const activePreview = isTourActive ? tourPreview : preview;

  const basePrice = activePreview?.basePrice ?? 0;
  const seasonDiscountApplied = activePreview?.seasonDiscountApplied ?? false;
  const cardDiscountAmount = activePreview?.cardDiscountAmount ?? 0;
  const finalPrice = activePreview?.finalPrice ?? 0;
  const cardPayback = activePreview?.paybackPoint ?? 0;

  const selectedCardData = CARD_LIST.find((c) => c.name === selectedCard);
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
    if (inputValue === '' || (point >= numValue && numValue >= 0)) {
      setValue(numValue);
    }
  };

  const handlePay = async () => {
    await createSelectedSeats(checked ? pointValue : 0, selectedCard, selectedPaymentMethod ?? '');
    closeModal('PayModal');
  };

  return {
    checked,
    value,
    isEventOpen,
    eventDropdownRef,
    handleToggleEventDropdown,
    seasonDiscountApplied,
    basePrice,
    cardDiscountAmount,
    cardPayback,
    finalPrice,
    point,
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
