
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface RevenueFieldProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Revenue Field Component
 * 
 * Displays and manages the expected monthly revenue input field
 */
export const RevenueField: React.FC<RevenueFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="expectedMonthlyRevenue"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Expected Monthly Revenue ($)*</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="0.00" 
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Used for revenue forecasting
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
