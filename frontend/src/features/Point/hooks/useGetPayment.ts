/**
 * @role: features/hooks
 * @rule: 외부 데이터 호출만 담당
 */
import { useEffect, useState } from 'react';
import { PaymentType } from '@/entities/Point/types/paymentType';
import { fetchPointHistory } from '../api/pointApi';

export const useGetPayment = () => {
  const [payment, setPayment] = useState<PaymentType[]>([]);

  useEffect(() => {
    fetchPointHistory()
      .then(setPayment)
      .catch(() => setPayment([]));
  }, []);

  return { payment };
};
