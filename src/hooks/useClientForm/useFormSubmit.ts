
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { createClient, updateClient } from '@/services/clientService';
import { ClientFormValues } from './schema';

/**
 * Custom hook to handle form submission logic
 * 
 * @param isEditMode - Whether the form is in edit mode
 * @param client - Current client data (if in edit mode)
 * @param navigate - Navigation function from React Router
 * @returns Form submission handler and loading state
 */
export const useFormSubmit = (
  isEditMode: boolean,
  client: Client | null,
  navigate: (path: string) => void
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle form submission
  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    
    // Create a properly typed client data object that meets the required interfaces
    const clientData = {
      legalName: data.legalName,
      primaryContact: data.primaryContact,
      email: data.email,
      phone: data.phone,
      billingAddress: data.billingAddress, 
      industry: data.industry as IndustryType,
      status: data.status as ClientStatus,
      expectedMonthlyRevenue: data.expectedMonthlyRevenue,
      paymentTerms: data.paymentTerms as PaymentTerms,
      billingFrequency: data.billingFrequency as BillingFrequency,
      defaultTaskPriority: data.defaultTaskPriority,
      staffLiaisonId: data.staffLiaisonId,
      notificationPreferences: {
        emailReminders: data.notificationPreferences.emailReminders,
        taskNotifications: data.notificationPreferences.taskNotifications,
      },
    };

    try {
      if (isEditMode && client) {
        const updatedClient = await updateClient(client.id, clientData);
        if (updatedClient) {
          toast({
            title: "Client updated",
            description: `${data.legalName} has been updated successfully.`,
          });
          navigate('/clients');
        }
      } else {
        const newClient = await createClient(clientData);
        if (newClient) {
          toast({
            title: "Client created",
            description: `${data.legalName} has been added successfully.`,
          });
          navigate('/clients');
        }
      }
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "Failed to save client data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    onSubmit,
    isLoading
  };
};
