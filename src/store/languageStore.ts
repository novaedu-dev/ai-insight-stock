import { create } from 'zustand';

export type Language = 'KO' | 'EN';

interface LanguageState {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: 'KO',
  toggleLang: () => set((state) => ({ lang: state.lang === 'KO' ? 'EN' : 'KO' })),
  setLang: (lang) => set({ lang }),
}));
