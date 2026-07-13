/**
 * @role: features — 사용자 결제 내역 Firestore 조회
 * @rule: 외부 데이터 호출만 담당
 */
import { auth, db } from '@/shared/firebase/firebase';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { OrderType } from '@/entities/Point/types/orderType';

export const useGetOrders = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const q = query(
        collection(db, 'orders', user.uid, 'detail'),
        orderBy('createAt', 'desc'),
      );
      const snap = await getDocs(q);
      const result = snap.docs.map((doc) => {
        const data = doc.data();
        const ts: Timestamp = data.createAt;
        const createAt =
          typeof ts?.seconds === 'number'
            ? ts.seconds
            : typeof ts?.toMillis === 'function'
              ? Math.floor(ts.toMillis() / 1000)
              : 0;

        return {
          startStationForView: data.startStationForView ?? '',
          endStationForView: data.endStationForView ?? '',
          startDay: data.startDay ?? '',
          startDayForView: data.startDayForView ?? '',
          trainType: data.trainType ?? '',
          selectAdult: data.selectAdult ?? 0,
          selectKid: data.selectKid ?? 0,
          seatCount: data.seatCount ?? 1,
          finalPrice: data.finalPrice ?? 0,
          paymentMethod: data.paymentMethod ?? '',
          selectedCard: data.selectedCard ?? null,
          isReturn: data.isReturn ?? false,
          createAt,
        } as OrderType;
      });

      setOrders(result);
    };

    fetchOrders();
  }, []);

  return { orders };
};
