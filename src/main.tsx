
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { AccessibilityProvider } from '@/components/common/AccessibilityEnhancements';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <App />
      <Toaster />
    </AccessibilityProvider>
  </React.StrictMode>,
);
