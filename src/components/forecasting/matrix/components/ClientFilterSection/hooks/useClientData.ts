
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Client } from '../types';

export const useClientData = () => {
  return useQuery({
    queryKey: ['clients-for-matrix-filter'],
    queryFn: async () => {
      console.log('🔍 ClientFilterSection: Starting client fetch...');
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, industry, status')
        .order('legal_name');
      
      if (error) {
        console.error('❌ ClientFilterSection: Database error:', error);
        throw error;
      }
      
      console.log('📊 ClientFilterSection: Raw client data received:', {
        totalClients: data?.length || 0,
        rawData: data,
        statusBreakdown: data?.reduce((acc, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });

      // Filter for active clients with case-insensitive matching
      const activeClients = data?.filter(client => {
        const status = client.status?.toLowerCase();
        return status === 'active';
      }) || [];

      console.log('✅ ClientFilterSection: Active clients filtered:', {
        activeCount: activeClients.length,
        activeClients: activeClients.map(c => ({ id: c.id, name: c.legal_name, status: c.status }))
      });
      
      return activeClients as Client[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
