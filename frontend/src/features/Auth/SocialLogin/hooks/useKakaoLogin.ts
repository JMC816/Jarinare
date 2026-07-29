import { KAKAO_AUTH_URL, REDIRECT_URI } from '@/shared/Social/KakaoConfig';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';

export const useKakaoLogin = () => {
  const onClick = () => {
    window.location.href = KAKAO_AUTH_URL;
  };
  return { onClick };
};

export const useKakaoRedirect = () => {
  const navigate = useNavigate();
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const run = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (!code) return;
      try {
        const { data } = await backendClient.post<{ accessToken: string }>('/oauth/kakao/login', {
          code,
          redirectUri: REDIRECT_URI,
        });
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        window.location.href = '/';
      } catch (e) {
        console.error('[KakaoLogin] 오류:', e);
        window.location.href = '/auth/login';
      }
    };
    run();
  }, []);
};
