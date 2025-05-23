
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface LegalNameFieldProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Legal Name Field Component
 * 
 * Displays and manages the legal name input field for a client
 */
export const LegalNameField: React.FC<LegalNameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="legalName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Legal Name*</FormLabel>
          <FormControl>
            <Input placeholder="Enter client's legal name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
