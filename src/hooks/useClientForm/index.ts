
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { getStaffForLiaisonDropdown } from '@/services/clientService';
import { clientFormSchema, getDefaultValues } from './schema';
import { useClientData } from './useClientData';
import { useFormSubmit } from './useFormSubmit';
import type { ClientFormValues } from './schema';
import type { StaffOption } from '@/types/staffOption';

/**
 * Custom hook to manage client form state and operations
 * 
 * This hook encapsulates all the logic needed for the client form, including:
 * - Form initialization with Zod validation
 * - Fetching client data for editing
 * - Fetching staff options for the liaison dropdown
 * - Form submission handling
 * - Navigation
 * 
 * @returns Object containing form state and handlers
 */
export const useClientForm = () => {
  const navigate = useNavigate();
  
  // Initialize form with default values and Zod validation
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: getDefaultValues()
  });
  
  // Fetch and manage client data for edit mode
  const { client, isClientLoading, isEditMode } = useClientData(form, navigate);
  
  // Handle form submission
  const { onSubmit, isLoading } = useFormSubmit(isEditMode, client, navigate);
  
  // Fetch staff members for the liaison dropdown
  const { data: staffOptions = [] } = useQuery({
    queryKey: ['staff', 'liaison-options'],
    queryFn: getStaffForLiaisonDropdown,
  });
  
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

// Re-export ClientFormValues type for convenience
export type { ClientFormValues } from './schema';
