
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
 * Now includes enhanced validation for better reliability
 */
export const StaffLiaisonField: React.FC<StaffLiaisonFieldProps> = ({ form, staffOptions }) => {
  // Enhanced validation to ensure only valid staff options are displayed
  const validStaffOptions = React.useMemo(() => {
    if (!Array.isArray(staffOptions)) {
      console.warn('StaffLiaisonField: staffOptions is not an array');
      return [];
    }
    
    return staffOptions.filter(staff => 
      staff && 
      typeof staff === 'object' && 
      staff.id && 
      typeof staff.id === 'string' && 
      staff.id.trim() !== '' &&
      staff.full_name &&
      typeof staff.full_name === 'string' &&
      staff.full_name.trim() !== ''
    );
  }, [staffOptions]);

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
              {validStaffOptions.map((staff: StaffOption) => (
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
