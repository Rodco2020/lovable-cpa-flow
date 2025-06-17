
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditTaskFormValues } from '../types';

interface PreferredStaffFieldProps {
  form: UseFormReturn<EditTaskFormValues>;
}

interface StaffOption {
  id: string;
  full_name: string;
}

export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  // Fetch active staff members
  const { data: staffOptions = [], isLoading } = useQuery({
    queryKey: ['staff-options'],
    queryFn: async (): Promise<StaffOption[]> => {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('status', 'active')
        .order('full_name');
      
      if (error) {
        console.error('Error fetching staff options:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  return (
    <FormField
      control={form.control}
      name="preferredStaffId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Staff Member (Optional)</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
            value={field.value || "none"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading staff..." : "Select preferred staff member"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">No preference</SelectItem>
              {staffOptions.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
