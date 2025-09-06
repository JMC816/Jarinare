import { auth, db } from '@/shared/firebase/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const onClick = async () => {
    try {
      // 구글 인증 제공자 생성
      const provieder = new GoogleAuthProvider();

      // 구글 로그인(팝업)
      await signInWithPopup(auth, provieder);

      await setDoc(doc(db, 'users', auth.currentUser!.uid), {
        userId: auth.currentUser?.uid,
        changeCount: 0,
        point: 0,
      });
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };
  return { onClick };
};
