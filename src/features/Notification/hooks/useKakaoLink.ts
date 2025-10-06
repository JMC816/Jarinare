import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/shared/firebase/firebase';
import { OAuthProvider, linkWithCredential } from 'firebase/auth';
import { KakaoToken } from './kakao';
import { KAKAO_LINK_URL } from '@/shared/Social/KakaoConfig';

export const useKakaoLink = () => {
  const onClick = () => {
    // 카카오 연동 페이지로 이동
    window.location.href = KAKAO_LINK_URL;
  };
  return { onClick };
};

export const useKakaoRedirectLink = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  useEffect(() => {
    const KaKaoRedirectLink = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (!code) return;
      try {
        // 카카오 토큰 요청
        const tokenData = await KakaoToken(code);
        // 카카오 OIDC로 제공자 생성
        const provider = new OAuthProvider('oidc.kakao');
        // 카카오에서 받은 토큰으로 인증 자격 생성
        const credential = provider.credential({
          idToken: tokenData.id_token,
        });

        // 기존 계정과 연동
        if (user) {
          await linkWithCredential(user, credential);
        }

        navigate('/');
      } catch (e) {
        console.error(e);
      }
    };
    KaKaoRedirectLink();
  }, []);
};
