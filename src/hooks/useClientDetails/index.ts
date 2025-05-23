
import { Client } from '@/types/client';
import { useClientFetch } from './useClientFetch';
import { useClientDelete } from './useClientDelete';

/**
 * Hook to manage client details state and operations
 * 
 * This hook encapsulates all the logic needed for client details management, including:
 * - Fetching client data
 * - Managing loading state
 * - Handling client deletion
 * - Refreshing client data
 * 
 * @param clientId - ID of the client to fetch details for
 * @returns Object containing client data and operations
 */
export const useClientDetails = (clientId?: string) => {
  const { client, isLoading, fetchClient } = useClientFetch(clientId);
  const { handleDelete } = useClientDelete(clientId);
  
  /**
   * Refresh client data
   */
  const refreshClient = async () => {
    await fetchClient();
  };
  
  return {
    client,
    isLoading,
    refreshClient,
    handleDelete
  };
};
