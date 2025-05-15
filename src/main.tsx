
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import './index.css';
import { isSupabaseConnected } from './lib/supabaseClient';

// Wrap our application with a ToastProvider component
const AppWithToasts = () => {
  const { toast } = useToast();
  
  // Show a global warning if Supabase is not connected
  useEffect(() => {
    if (!isSupabaseConnected()) {
      toast({
        title: "Supabase Not Connected",
        description: "The app will use in-memory storage instead of persisting data.",
        // Fixed: Use valid toast variant
        variant: "destructive"
      });
    }
  }, [toast]);

  return (
    <>
      <App />
      <Toaster />
    </>
  );
};

// Import the useToast hook here to ensure it's imported within a component context
import { useToast } from '@/hooks/use-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithToasts />
  </React.StrictMode>,
);
