
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditTaskFormValues } from '../types';
import { StaffOption } from '@/types/staffOption';

interface PreferredStaffFieldProps {
  form: UseFormReturn<EditTaskFormValues>;
}

export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  // Fetch active staff members using the optimized dropdown service
  const { data: staffOptions = [], isLoading } = useQuery<StaffOption[]>({
    queryKey: ['staff-dropdown-options'],
    queryFn: getActiveStaffForDropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache (renamed from cacheTime)
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
