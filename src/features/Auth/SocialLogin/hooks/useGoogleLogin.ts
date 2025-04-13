import { auth } from '@/shared/firebase/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      // 구글 인증 제공자 생성
      const provieder = new GoogleAuthProvider();
      // 구글 로그인(팝업)
      await signInWithPopup(auth, provieder);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };
  return { onClick };
};
