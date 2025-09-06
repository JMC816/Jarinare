import { PaymentType } from '@/entities/Point/types/paymentType';
import { auth, db } from '@/shared/firebase/firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export const useGetPayment = () => {
  const [payment, setPayment] = useState<PaymentType[]>([]);
  const user = auth.currentUser;

  // 각 사용자의 포인트 지급 내역
  useEffect(() => {
    const getPayments = async () => {
      const paymentQuery = query(
        collection(db, 'payments', user!.uid, 'detail'),
        orderBy('createAt', 'desc'),
      );
      const existPayments = await getDocs(paymentQuery);
      const payments = existPayments.docs.map((item) => {
        const data = item.data();
        const ts: Timestamp = data.createAt;

        const createAtSeconds =
          typeof ts?.seconds === 'number'
            ? ts.seconds
            : typeof ts?.toMillis === 'function'
              ? Math.floor(ts.toMillis() / 1000)
              : 0;

        return {
          accruedPoint: data.accruedPoint,
          createAt: createAtSeconds,
        } as PaymentType;
      });
      setPayment(payments);
    };
    getPayments();
  }, []);
  return { payment };
};
