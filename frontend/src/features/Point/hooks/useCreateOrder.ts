/**
 * @role: features/hooks
 * @rule: 백엔드 예매 API가 주문 내역을 함께 처리하므로 별도 호출 불필요
 */
import { OrderType } from '@/entities/Point/types/orderType';

export const useCreateOrder = () => {
  const createOrder = async (_order: Omit<OrderType, 'createAt'>) => {};
  return { createOrder };
};
