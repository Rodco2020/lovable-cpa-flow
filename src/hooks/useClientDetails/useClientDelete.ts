
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { deleteClient } from '@/services/clientService';

/**
 * Custom hook for handling client deletion
 * 
 * @param clientId - ID of the client to delete
 * @returns Object containing delete handler
 */
export const useClientDelete = (clientId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  /**
   * Handle client deletion
   * 
   * Deletes client from the database and navigates back to client list
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
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client.",
        variant: "destructive"
      });
    }
  };
  
  return {
    handleDelete
  };
};
