/**
 * @role: features/api
 * @rule: 포인트·주문 내역 백엔드 API 호출만 담당
 */
import { backendClient } from '@/shared/api/backendClient';
import { OrderType } from '@/entities/Point/types/orderType';
import { PaymentType } from '@/entities/Point/types/paymentType';

export const fetchOrders = async (): Promise<OrderType[]> => {
  const { data } = await backendClient.get<OrderType[]>('/api/orders/me');
  return data;
};

export const fetchPointHistory = async (): Promise<PaymentType[]> => {
  const { data } = await backendClient.get<PaymentType[]>('/api/points/history');
  return data;
};
