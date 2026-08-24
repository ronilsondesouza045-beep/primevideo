import React from 'react';
import { useModalStore } from '../store/useModalStore';
import { useAuthStore } from '../store/useAuthStore';
import { AuthModal } from './AuthModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationsModal } from './NotificationsModal';
import { PrimeModal } from './PrimeModal';
import { ParamountModal } from './ParamountModal';
import { CrunchyrollModal } from './CrunchyrollModal';
import { ChatGptModal } from './ChatGptModal';
import { IptvModal } from './IptvModal';
import { NetflixModal } from './NetflixModal';
import { FreeFireModal } from './FreeFireModal';
import { ServiceReviewsModal } from './ServiceReviewsModal';

interface ModalManagerProps {
  onNavigate?: (tab: string) => void;
  primeBlocked?: boolean;
  primeError?: string | null;
  freeFireStock?: { total: number; available: number; claimed: number; outOfStock: boolean };
}

export const ModalManager: React.FC<ModalManagerProps> = ({
  onNavigate,
  primeBlocked = false,
  primeError = null,
  freeFireStock = { total: 0, available: 0, claimed: 0, outOfStock: true }
}) => {
  const { user, checkSession } = useAuthStore();
  const {
    isAuthOpen,
    closeAuth,
    isForgotPassOpen,
    closeForgotPass,
    isSearchOpen,
    closeSearch,
    isNotifsOpen,
    closeNotifs,
    isIptvModalOpen,
    closeIptvModal,
    primeCreds,
    setPrimeCreds,
    paramountCreds,
    setParamountCreds,
    crunchyrollCreds,
    setCrunchyrollCreds,
    chatgptCreds,
    setChatGptCreds,
    openChat,
    selectedReviewService,
    setSelectedReviewService,
    freeFireResult,
    setFreeFireResult,
    activePayment,
    setActivePayment
  } = useModalStore();

  const getServiceName = (id: string | null) => {
    switch (id) {
      case 'prime': return 'Prime Video VIP';
      case 'paramount': return 'Paramount+ VIP';
      case 'freefire': return 'Free Fire Codiguin';
      case 'crunchyroll': return 'Crunchyroll Premium';
      case 'chatgpt': return 'ChatGPT Plus/Pro';
      default: return 'Serviço VIP';
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
        onSuccess={(loggedUser) => {
          if (loggedUser) {
            useAuthStore.getState().setUser(loggedUser);
          }
          checkSession();
          closeAuth();
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotPassOpen}
        onClose={closeForgotPass}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSelectTab={(tab) => {
          closeSearch();
          if (onNavigate) onNavigate(tab);
        }}
      />

      <NotificationsModal
        isOpen={isNotifsOpen}
        onClose={closeNotifs}
        user={user}
      />

      {primeCreds && (
        <PrimeModal
          credentials={primeCreds}
          onClose={() => setPrimeCreds(null)}
          blocked={primeBlocked}
          errorMessage={primeError}
        />
      )}

      {paramountCreds && (
        <ParamountModal
          credentials={paramountCreds}
          onClose={() => setParamountCreds(null)}
          onOpenChat={openChat}
        />
      )}

      {crunchyrollCreds && (
        <CrunchyrollModal
          credentials={crunchyrollCreds}
          onClose={() => setCrunchyrollCreds(null)}
          onOpenChat={openChat}
        />
      )}

      {chatgptCreds && (
        <ChatGptModal
          credentials={chatgptCreds}
          onClose={() => setChatGptCreds(null)}
          onOpenChat={openChat}
        />
      )}

      <IptvModal
        isOpen={isIptvModalOpen}
        onClose={closeIptvModal}
      />

      {activePayment && (
        <NetflixModal
          isOpen={!!activePayment}
          onClose={() => setActivePayment(null)}
          payment={activePayment}
          user={user}
        />
      )}

      {freeFireResult && (
        <FreeFireModal
          result={freeFireResult}
          onClose={() => setFreeFireResult(null)}
          stock={freeFireStock}
        />
      )}

      {selectedReviewService && (
        <ServiceReviewsModal
          isOpen={!!selectedReviewService}
          onClose={() => setSelectedReviewService(null)}
          serviceId={selectedReviewService}
          serviceName={getServiceName(selectedReviewService)}
        />
      )}
    </>
  );
};
