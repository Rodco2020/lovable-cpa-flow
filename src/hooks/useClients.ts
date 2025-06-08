
import { useQuery } from '@tanstack/react-query';
import { getClients } from '@/services/clientService';

/**
 * Hook to fetch all clients
 */
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });
};
