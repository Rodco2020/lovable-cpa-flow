
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { mapClientData } from '../utils/clientDataMapper';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for fetching available clients
 */
export const useClientsData = () => {
  return useQuery({
    queryKey: ['available-clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'Active')
        .order('legal_name');

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Error",
          description: "Failed to load clients.",
          variant: "destructive",
        });
        return [];
      }

      return data.map(mapClientData);
    }
  });
};
