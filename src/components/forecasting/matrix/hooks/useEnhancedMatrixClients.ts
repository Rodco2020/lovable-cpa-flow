
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseEnhancedMatrixClientsProps {
  selectedClientIds: string[];
  setSelectedClientIds: (clientIds: string[]) => void;
}

interface UseEnhancedMatrixClientsResult {
  clients: Array<{ id: string; legal_name: string }>;
  clientNames: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

export const useEnhancedMatrixClients = ({
  selectedClientIds,
  setSelectedClientIds
}: UseEnhancedMatrixClientsProps): UseEnhancedMatrixClientsResult => {
  // Fetch client names for display and default selection
  const { data: clientData, isLoading, error } = useQuery({
    queryKey: ['client-names'],
    queryFn: async () => {
      console.log('🔍 EnhancedCapacityMatrix: Fetching clients for default selection...');
      
      // Fetch clients using case-insensitive status match
      const { data, error } = await supabase
        .from('clients')
        .select('id, legal_name, status')
        .in('status', ['active', 'Active']);
      
      if (error) {
        console.error('❌ EnhancedCapacityMatrix: Client fetch error:', error);
        throw error;
      }
      
      const statusCounts = (data || []).reduce<Record<string, number>>(
        (acc, client) => {
          acc[client.status] = (acc[client.status] || 0) + 1;
          return acc;
        },
        {}
      );

      console.log('📊 EnhancedCapacityMatrix: Client data received:', {
        totalClients: data?.length || 0,
        statusCounts,
        clientIds: data?.map(c => c.id) || []
      });
      
      // Return both the names object and the full client data
      const clientNames = (data || []).reduce<Record<string, string>>(
        (acc, client) => ({
          ...acc,
          [client.id]: client.legal_name
        }),
        {}
      );

      return {
        clientNames,
        clients: (data || []).map(({ id, legal_name }) => ({ id, legal_name }))
      };
    }
  });

  // Extract clients and clientNames from the query data
  const clients = clientData?.clients || [];
  const clientNames = clientData?.clientNames || {};

  // Default client selection logic - Phase 2 Implementation
  useEffect(() => {
    if (clients.length > 0 && selectedClientIds.length === 0) {
      const allClientIds = clients.map(client => client.id);
      
      console.log('🎯 EnhancedCapacityMatrix: Implementing default client selection:', {
        totalAvailableClients: allClientIds.length,
        clientIds: allClientIds,
        currentSelection: selectedClientIds.length
      });
      
      setSelectedClientIds(allClientIds);
      
      console.log('✅ EnhancedCapacityMatrix: Default client selection completed:', {
        selectedCount: allClientIds.length,
        selectedIds: allClientIds
      });
    }
  }, [clients, selectedClientIds.length, setSelectedClientIds]);

  return {
    clients,
    clientNames,
    isLoading,
    error: error?.message || null
  };
};
