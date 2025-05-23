
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Client } from '@/types/client';
import { getClientById, deleteClient } from '@/services/clientService';

/**
 * Hook to manage client details state and operations
 */
export const useClientDetails = (clientId?: string) => {
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
  
  /**
   * Refresh client data
   */
  const refreshClient = async () => {
    await fetchClient();
  };
  
  /**
   * Handle client deletion
   */
  const handleDelete = async () => {
    if (!clientId) return;
    
    try {
      await deleteClient(clientId);
      toast({
        title: "Client deleted",
        description: "Client has been successfully deleted.",
      });
      navigate('/clients');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive"
      });
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchClient();
  }, [clientId]);
  
  return {
    client,
    isLoading,
    refreshClient,
    handleDelete
  };
};
