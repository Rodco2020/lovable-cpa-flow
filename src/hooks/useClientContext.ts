
import { useState, createContext, useContext } from 'react';

interface ClientContextType {
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

/**
 * Hook for managing client context across tabs
 * Provides state management for selected client
 */
export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

/**
 * Custom hook for client state management
 * Can be used independently for local client selection
 */
export const useClientState = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return {
    selectedClientId,
    setSelectedClientId
  };
};

export { ClientContext };
export type { ClientContextType };
