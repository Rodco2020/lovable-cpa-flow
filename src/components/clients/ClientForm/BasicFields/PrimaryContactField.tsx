
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface PrimaryContactFieldProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Primary Contact Field Component
 * 
 * Displays and manages the primary contact input field for a client
 */
export const PrimaryContactField: React.FC<PrimaryContactFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="primaryContact"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Primary Contact*</FormLabel>
          <FormControl>
            <Input placeholder="Full name of primary contact" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
