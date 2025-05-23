
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';

interface PaymentBillingFieldsProps {
  form: UseFormReturn<ClientFormValues>;
}

/**
 * Payment Terms and Billing Frequency Fields
 * 
 * Displays and manages payment terms and billing frequency dropdown selectors
 */
export const PaymentBillingFields: React.FC<PaymentBillingFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="paymentTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Terms*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Net15">Net 15</SelectItem>
                <SelectItem value="Net30">Net 30</SelectItem>
                <SelectItem value="Net45">Net 45</SelectItem>
                <SelectItem value="Net60">Net 60</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="billingFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Billing Frequency*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Annually">Annually</SelectItem>
                <SelectItem value="Project-Based">Project-Based</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
