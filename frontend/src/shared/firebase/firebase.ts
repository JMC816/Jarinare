import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_apiKey,
  authDomain: import.meta.env.VITE_APP_authDomain,
  projectId: import.meta.env.VITE_APP_projectId,
  databaseURL: import.meta.env.VITE_APP_databaseUrl,
  appId: import.meta.env.VITE_APP_appId,
};

const app = initializeApp(firebaseConfig);

export const realtimeDb = getDatabase(app);
