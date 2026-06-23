import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Suppress Recharts warnings about width/height
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('of chart should be greater than 0')) {
    return;
  }
  if (typeof args[0] === 'string' && args[0].includes('defaultProps will be removed from function components')) {
    return;
  }
  originalWarn(...args);
};

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
