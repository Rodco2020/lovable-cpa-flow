
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';

/**
 * Hook for fetching client data used in operations
 */
export const useClientsData = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });
};
