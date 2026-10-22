export const REST_API_KEY = import.meta.env.VITE_APP_REST_API_KEY;

export const REDIRECT_URI = `${window.location.origin}/oauth/kakao/callback`;
export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid%20account_email`;
