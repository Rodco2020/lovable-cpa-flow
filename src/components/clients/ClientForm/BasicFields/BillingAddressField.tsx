
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface BillingAddressFieldProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Billing Address Field Component
 * 
 * Displays and manages the billing address textarea for a client
 */
export const BillingAddressField: React.FC<BillingAddressFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="billingAddress"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Billing Address*</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Full billing address" 
              className="resize-none" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
