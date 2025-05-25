
import { useCallback } from 'react';
import { Client } from '@/types/client';

/**
 * Hook for resolving client names from client IDs
 * 
 * Provides utility functions to get client names for source and target clients
 * used in copy operations, with fallback handling for missing clients.
 */
export const useClientNames = (
  clients: Client[],
  sourceClientId?: string,
  targetClientId?: string | null
) => {
  const getSourceClientName = useCallback(() => {
    if (!sourceClientId) return 'Unknown Client';
    const client = clients.find(c => c.id === sourceClientId);
    return client?.legalName || 'Unknown Client';
  }, [clients, sourceClientId]);

  const getTargetClientName = useCallback(() => {
    if (!targetClientId) return 'Unknown Client';
    const client = clients.find(c => c.id === targetClientId);
    return client?.legalName || 'Unknown Client';
  }, [clients, targetClientId]);

  return {
    getSourceClientName,
    getTargetClientName
  };
};
