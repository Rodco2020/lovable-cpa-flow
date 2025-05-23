
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '@/hooks/useClientForm';
import { StaffOption } from '@/types/staffOption';

interface StaffLiaisonFieldProps {
  form: UseFormReturn<ClientFormValues>;
  staffOptions: StaffOption[];
}

/**
 * Staff Liaison Field Component
 * 
 * Displays and manages the staff liaison dropdown selector
 */
export const StaffLiaisonField: React.FC<StaffLiaisonFieldProps> = ({ form, staffOptions }) => {
  return (
    <FormField
      control={form.control}
      name="staffLiaisonId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Staff Liaison</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || undefined}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select staff liaison" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">No liaison assigned</SelectItem>
              {staffOptions.map((staff: StaffOption) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Staff member responsible for this client relationship
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
