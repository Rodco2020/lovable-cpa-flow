
import { useCallback } from 'react';
import { Client } from '@/types/client';

/**
 * Hook for resolving client names from client IDs
 * 
 * Provides utility functions to get source and target client names
 * for display purposes in the copy operation wizard.
 */
export const useClientNames = (
  clients: Client[],
  initialClientId?: string,
  copyTargetClientId?: string
) => {
  const getSourceClientName = useCallback(() => {
    const result = (() => {
      if (!initialClientId || !Array.isArray(clients)) return '';
      const sourceClient = clients.find((c: Client) => c.id === initialClientId);
      return sourceClient?.legalName || '';
    })();
    
    console.log('🔍 PHASE 1 DIAGNOSTIC - useClientNames: getSourceClientName called', {
      initialClientId,
      clientsCount: clients.length,
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }, [initialClientId, clients]);

  const getTargetClientName = useCallback(() => {
    const result = (() => {
      if (!copyTargetClientId || !Array.isArray(clients)) return '';
      const targetClient = clients.find((c: Client) => c.id === copyTargetClientId);
      return targetClient?.legalName || '';
    })();
    
    console.log('🔍 PHASE 1 DIAGNOSTIC - useClientNames: getTargetClientName called', {
      copyTargetClientId,
      clientsCount: clients.length,
      result,
      timestamp: new Date().toISOString()
    });
    
    return result;
  }, [copyTargetClientId, clients]);

  return {
    getSourceClientName,
    getTargetClientName
  };
};
