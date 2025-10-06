import {
  CLIENT_SECRET,
  REDIRECT_LINK,
  REST_API_KEY,
} from '@/shared/Social/KakaoConfig';
import axios from 'axios';

// 카카오 토큰 요청
export const KakaoToken = async (code: string) => {
  const payload = {
    grant_type: 'authorization_code',
    client_id: REST_API_KEY,
    redirect_uri: REDIRECT_LINK,
    code,
    client_secret: CLIENT_SECRET,
  };
  const response = await axios.post(
    'https://kauth.kakao.com/oauth/token',
    payload,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    },
  );
  return response.data;
};
