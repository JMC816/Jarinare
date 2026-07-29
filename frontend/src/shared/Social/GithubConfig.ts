export const GITHUB_CLIENT_ID = import.meta.env.VITE_APP_GITHUB_CLIENT_ID as string;

export const REDIRECT_URI = `${window.location.origin}/oauth/github/callback`;

export const GITHUB_AUTH_URL =
  `https://github.com/login/oauth/authorize` +
  `?client_id=${GITHUB_CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=user:email`;
