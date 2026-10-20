/**
 * @role: features/hooks
 * @rule: 외부 데이터 호출만 담당
 */
import { useEffect, useState } from 'react';
import { OrderType } from '@/entities/Point/types/orderType';
import { fetchOrders } from '../api/pointApi';

export const useGetOrders = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return { orders };
};
