// @role: features
// @rule: 구글 OAuth 리다이렉트 로그인 (NestJS /oauth/google/login)
import { GOOGLE_AUTH_URL, REDIRECT_URI } from '@/shared/Social/GoogleConfig';
import { backendClient, ACCESS_TOKEN_KEY } from '@/shared/api/backendClient';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const useGoogleLogin = () => {
  const onClick = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };
  return { onClick };
};

export const useGoogleRedirect = () => {
  const navigate = useNavigate();
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const run = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (!code) return;
      try {
        const { data } = await backendClient.post<{ accessToken: string }>(
          '/oauth/google/login',
          { code, redirectUri: REDIRECT_URI },
        );
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        window.location.href = '/';
      } catch (e) {
        console.error('[GoogleLogin] 오류:', e);
        window.location.href = '/auth/login';
      }
    };
    run();
  }, []);
};
