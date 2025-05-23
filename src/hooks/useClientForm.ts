
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Client, ClientStatus, IndustryType, PaymentTerms, BillingFrequency } from '@/types/client';
import { getClientById, createClient, updateClient, getStaffForLiaisonDropdown } from '@/services/clientService';
import { StaffOption } from '@/types/staffOption';

/**
 * Form schema for client data validation
 */
const clientFormSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  primaryContact: z.string().min(1, "Primary contact is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  industry: z.enum([
    "Retail", 
    "Healthcare", 
    "Manufacturing", 
    "Technology", 
    "Financial Services", 
    "Professional Services", 
    "Construction", 
    "Hospitality", 
    "Education", 
    "Non-Profit",
    "Other"
  ] as const),
  status: z.enum(["Active", "Inactive", "Pending", "Archived"] as const),
  expectedMonthlyRevenue: z.coerce.number().positive("Revenue must be positive"),
  paymentTerms: z.enum(["Net15", "Net30", "Net45", "Net60"] as const),
  billingFrequency: z.enum(["Monthly", "Quarterly", "Annually", "Project-Based"] as const),
  defaultTaskPriority: z.string().min(1, "Default task priority is required"),
  staffLiaisonId: z.string().nullable().optional(),
  notificationPreferences: z.object({
    emailReminders: z.boolean().default(true),
    taskNotifications: z.boolean().default(true),
  }),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

/**
 * Custom hook to manage client form state and operations
 */
export const useClientForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(isEditMode);
  
  // Fetch staff members for the liaison dropdown
  const { data: staffOptions = [] } = useQuery({
    queryKey: ['staff', 'liaison-options'],
    queryFn: getStaffForLiaisonDropdown,
  });
  
  // Initialize form with default values
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      legalName: "",
      primaryContact: "",
      email: "",
      phone: "",
      billingAddress: "",
      industry: "Other" as IndustryType,
      status: "Active" as ClientStatus,
      expectedMonthlyRevenue: 0,
      paymentTerms: "Net30" as PaymentTerms,
      billingFrequency: "Monthly" as BillingFrequency,
      defaultTaskPriority: "Medium",
      staffLiaisonId: null,
      notificationPreferences: {
        emailReminders: true,
        taskNotifications: true,
      },
    }
  });
  
  // Fetch client data if in edit mode
  useEffect(() => {
    const fetchClient = async () => {
      if (isEditMode) {
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
    form,
    isEditMode,
    isLoading,
    isClientLoading,
    client,
    staffOptions: staffOptions as StaffOption[],
    onSubmit,
    navigate
  };
};
