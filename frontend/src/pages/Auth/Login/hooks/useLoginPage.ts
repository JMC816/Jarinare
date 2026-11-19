/**
 * @role: page
 * @rule: hooks — 상태·사이드이펙트·이벤트 핸들러 담당
 */
import { useEffect } from 'react';
import useModalStore from '@/widgets/model/AuthStore';
import { LoginMessageStore } from '@/features/Auth/Login/model/useLoginStore';

export const useLoginPage = (formOpen: boolean) => {
  const { isShow, resetModal } = useModalStore();
  const { setMessage } = LoginMessageStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('suspended') === '1') {
      setMessage('정지된 계정입니다. 고객센터에 문의해 주세요.');
    }
  }, []);

  // 모달 열릴 때 history 상태 push — 뒤로가기로 모달 닫기 지원
  useEffect(() => {
    if (formOpen) {
      window.history.pushState({ modal: true }, '');
    }
  }, [formOpen]);

  // 브라우저 뒤로가기 시 모달 초기화
  useEffect(() => {
    const handlePopState = () => {
      if (isShow) resetModal();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isShow, resetModal]);
};
