
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';

/**
 * Hook to fetch all clients
 */
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });
};
