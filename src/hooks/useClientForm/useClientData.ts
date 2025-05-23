
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Client } from '@/types/client';
import { getClientById } from '@/services/clientService';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from './schema';

/**
 * Custom hook to fetch client data for edit mode
 * 
 * @param form - React Hook Form instance
 * @param navigate - Navigation function from React Router
 * @returns Object containing client data and loading state
 */
export const useClientData = (
  form: UseFormReturn<ClientFormValues>,
  navigate: (path: string) => void
) => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditMode = !!id;
  const [client, setClient] = useState<Client | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(isEditMode);
  
  // Fetch client data if in edit mode
  useEffect(() => {
    const fetchClient = async () => {
      if (!isEditMode) {
        setIsClientLoading(false);
        return;
      }
      
      try {
        const fetchedClient = await getClientById(id!);
        if (fetchedClient) {
          setClient(fetchedClient);
        } else {
          toast({
            title: "Client not found",
            description: "The requested client could not be found.",
            variant: "destructive"
          });
          navigate('/clients');
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({
          title: "Error",
          description: "Failed to load client details.",
          variant: "destructive"
        });
      } finally {
        setIsClientLoading(false);
      }
    };
    
    fetchClient();
  }, [id, isEditMode, navigate, toast]);
  
  // Update form values when client data is loaded
  useEffect(() => {
    if (client && isEditMode) {
      Object.keys(client).forEach(key => {
        const clientKey = key as keyof Client;
        if (clientKey !== 'id' && clientKey !== 'createdAt' && clientKey !== 'updatedAt') {
          if (clientKey === 'notificationPreferences') {
            form.setValue('notificationPreferences.emailReminders', client.notificationPreferences.emailReminders);
            form.setValue('notificationPreferences.taskNotifications', client.notificationPreferences.taskNotifications);
          } else if (clientKey === 'staffLiaisonId') { 
            form.setValue('staffLiaisonId', client.staffLiaisonId || null);
          } else {
            // @ts-ignore - This is a bit hacky but works for our known properties
            form.setValue(clientKey, client[clientKey]);
          }
        }
      });
    }
  }, [client, form, isEditMode]);
  
  return {
    client,
    isClientLoading,
    isEditMode
  };
};
