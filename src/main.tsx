
import React from 'react';
import ReactDOM from 'react-dom/client';
import { toast } from '@/components/ui/use-toast';
import App from './App';
import './index.css';
import { isSupabaseConnected } from './lib/supabaseClient';

// Show a global warning if Supabase is not connected
if (!isSupabaseConnected()) {
  // Add a small delay to ensure toast system is initialized
  setTimeout(() => {
    toast({
      title: "Supabase Not Connected",
      description: "The app will use in-memory storage instead of persisting data.",
      variant: "warning" as any
    });
  }, 1000);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
