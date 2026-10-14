import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import {ProfessionalShell} from './components/ProfessionalShell.tsx';
import './professional-v2.css';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';
import {registerServiceWorker} from './pwa';

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ProfessionalShell>
          <App />
        </ProfessionalShell>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
