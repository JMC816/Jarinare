/**
 * @role: features — 결제 완료 시 주문 내역 Firestore 저장
 * @rule: 외부 데이터 호출만 담당
 */
import { auth, db } from '@/shared/firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { OrderType } from '@/entities/Point/types/orderType';

export const useCreateOrder = () => {
  const createOrder = async (order: Omit<OrderType, 'createAt'>) => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'orders', user.uid, 'detail'), {
      ...order,
      createAt: serverTimestamp(),
    });
  };

  return { createOrder };
};
