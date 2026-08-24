import { create } from 'zustand';
import { ServiceCredentials } from '../types';

interface ModalState {
  isAuthOpen: boolean;
  isForgotPassOpen: boolean;
  isSearchOpen: boolean;
  isNotifsOpen: boolean;
  isIptvModalOpen: boolean;
  isChatOpen: boolean;

  primeCreds: ServiceCredentials | null;
  paramountCreds: ServiceCredentials | null;
  crunchyrollCreds: ServiceCredentials | null;
  chatgptCreds: ServiceCredentials | null;
  selectedReviewService: 'prime' | 'paramount' | 'freefire' | 'crunchyroll' | 'chatgpt' | null;

  freeFireResult: {
    code?: string;
    message: string;
    success: boolean;
    outOfStock?: boolean;
    alreadyClaimed?: boolean;
  } | null;

  activePayment: {
    id: string;
    status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
    tonLink: string;
    pixCode: string;
    credentials: ServiceCredentials | null;
  } | null;

  // Actions
  openAuth: () => void;
  closeAuth: () => void;
  openForgotPass: () => void;
  closeForgotPass: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  openNotifs: () => void;
  closeNotifs: () => void;
  openIptvModal: () => void;
  closeIptvModal: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  setPrimeCreds: (creds: ServiceCredentials | null) => void;
  setParamountCreds: (creds: ServiceCredentials | null) => void;
  setCrunchyrollCreds: (creds: ServiceCredentials | null) => void;
  setChatGptCreds: (creds: ServiceCredentials | null) => void;
  setSelectedReviewService: (service: 'prime' | 'paramount' | 'freefire' | 'crunchyroll' | 'chatgpt' | null) => void;
  setFreeFireResult: (result: ModalState['freeFireResult']) => void;
  setActivePayment: (payment: ModalState['activePayment']) => void;

  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isAuthOpen: false,
  isForgotPassOpen: false,
  isSearchOpen: false,
  isNotifsOpen: false,
  isIptvModalOpen: false,
  isChatOpen: false,

  primeCreds: null,
  paramountCreds: null,
  crunchyrollCreds: null,
  chatgptCreds: null,
  selectedReviewService: null,
  freeFireResult: null,
  activePayment: null,

  openAuth: () => set({ isAuthOpen: true }),
  closeAuth: () => set({ isAuthOpen: false }),
  openForgotPass: () => set({ isForgotPassOpen: true }),
  closeForgotPass: () => set({ isForgotPassOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openNotifs: () => set({ isNotifsOpen: true }),
  closeNotifs: () => set({ isNotifsOpen: false }),
  openIptvModal: () => set({ isIptvModalOpen: true }),
  closeIptvModal: () => set({ isIptvModalOpen: false }),
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  setPrimeCreds: (creds) => set({ primeCreds: creds }),
  setParamountCreds: (creds) => set({ paramountCreds: creds }),
  setCrunchyrollCreds: (creds) => set({ crunchyrollCreds: creds }),
  setChatGptCreds: (creds) => set({ chatgptCreds: creds }),
  setSelectedReviewService: (service) => set({ selectedReviewService: service }),
  setFreeFireResult: (result) => set({ freeFireResult: result }),
  setActivePayment: (payment) => set({ activePayment: payment }),

  closeAllModals: () => set({
    isAuthOpen: false,
    isForgotPassOpen: false,
    isSearchOpen: false,
    isNotifsOpen: false,
    isIptvModalOpen: false,
    primeCreds: null,
    paramountCreds: null,
    crunchyrollCreds: null,
    chatgptCreds: null,
    selectedReviewService: null,
    freeFireResult: null,
    activePayment: null
  })
}));
