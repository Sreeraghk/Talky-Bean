import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeService } from './services/ThemeService';
import { ErrorBoundary } from './components/ErrorBoundary';

// Initialize light/dark theme default on document
ThemeService.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
