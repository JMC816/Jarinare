export const GOOGLE_CLIENT_ID = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID as string;

export const REDIRECT_URI = `${window.location.origin}/oauth/google/callback`;

export const GOOGLE_AUTH_URL =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent('openid email profile')}` +
  `&access_type=offline` +
  `&prompt=select_account`;
