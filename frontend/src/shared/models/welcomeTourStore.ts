import { create } from 'zustand';

interface WelcomeTourStore {
  isActive: boolean;
  step: number; // 1~4
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
}

const LS_KEY = 'jarinare-tour-done';

const welcomeTourStore = create<WelcomeTourStore>((set) => ({
  isActive: false,
  step: 1,
  startTour: () => {
    localStorage.setItem(LS_KEY, '1');
    set({ isActive: true, step: 1 });
  },
  nextStep: () =>
    set((s) => {
      if (s.step >= 5) {
        localStorage.setItem(LS_KEY, '1');
        return { isActive: false, step: 1 };
      }
      return { step: s.step + 1 };
    }),
  skipTour: () => {
    localStorage.setItem(LS_KEY, '1');
    set({ isActive: false, step: 1 });
  },
}));

export const hasTourCompleted = () => localStorage.getItem(LS_KEY) === '1';

export default welcomeTourStore;
