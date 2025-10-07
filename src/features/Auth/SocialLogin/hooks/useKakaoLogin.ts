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

        // HACK: 추후 백단 변경 예정

        //  onAuthStateChanged(auth, async (user) => {
        //    if (user) {
        //      // 이미 로그인된 사용자라면 계정에 토큰 연동
        //      await linkWithCredential(user, credential);

        //      // Firestore에 access token 저장
        //      await updateDoc(doc(db, 'users', user.uid), {
        //        kakaoTokens: arrayUnion(tokenData.access_token),
        //      });
        //    } else {
        //      // 새로 로그인하는 경우
        //      await signInWithCredential(auth, credential);

        //      await setDoc(doc(db, 'users', auth.currentUser!.uid), {
        //        userId: auth.currentUser?.uid,
        //        changeCount: 0,
        //        point: 0,
        //        kakaoTokens: [tokenData.access_token], // DB에 저장
        //      });
        //    }
        //  });

        navigate('/');
      } catch (e) {
        console.log(e);
      }
    };
    KakaoRedirect();
  }, []);
};
