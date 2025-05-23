
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Client } from '@/types/client';
import { getClientById } from '@/services/clientService';

/**
 * Custom hook for fetching client data
 * 
 * @param clientId - ID of the client to fetch
 * @returns Client data and loading state
 */
export const useClientFetch = (clientId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Fetch client data from the API
   */
  const fetchClient = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const clientData = await getClientById(clientId);
      setClient(clientData);
    } catch (error) {
      console.error('Error fetching client:', error);
      toast({
        title: "Error",
        description: "Failed to load client details.",
        variant: "destructive"
      });
      navigate('/clients');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch when component mounts or clientId changes
  useEffect(() => {
    fetchClient();
  }, [clientId]);
  
  return {
    client,
    isLoading,
    fetchClient
  };
};
