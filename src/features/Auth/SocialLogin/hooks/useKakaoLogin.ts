import { KAKAO_AUTH_URL } from '@/shared/Social/KakaoConfig';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '@/shared/firebase/firebase';
import { KakaoToken } from '../api/Kakao';
import { doc, setDoc } from 'firebase/firestore';

export const useKakaoLogin = () => {
  const onClick = () => {
    // 카카오 로그인 페이지로 이동
    window.location.href = KAKAO_AUTH_URL;
  };
  return { onClick };
};

export const useKakaoRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const KakaoRedirect = async () => {
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

        // 인증 자격으로 로그인
        await signInWithCredential(auth, credential);

        await setDoc(doc(db, 'users', auth.currentUser!.uid), {
          userId: auth.currentUser?.uid,
          changeCount: 0,
          point: 0,
        });

        navigate('/');
      } catch (e) {
        console.log(e);
      }
    };
    KakaoRedirect();
  }, []);
};
