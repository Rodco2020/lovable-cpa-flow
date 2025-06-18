
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

  // PHASE 1: Enhanced logging for diagnostic purposes
  React.useEffect(() => {
    const currentValue = form.getValues('preferredStaffId');
    console.log('🔍 [PreferredStaffField] Component mounted/updated:', {
      currentFormValue: currentValue,
      staffOptionsCount: staffOptions.length,
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [form, staffOptions, isLoading]);

  // PHASE 1: Watch for form value changes
  const watchedValue = form.watch('preferredStaffId');
  React.useEffect(() => {
    console.log('👀 [PreferredStaffField] Form value changed:', {
      newValue: watchedValue,
      valueType: typeof watchedValue,
      isNull: watchedValue === null,
      isUndefined: watchedValue === undefined,
      timestamp: new Date().toISOString()
    });
  }, [watchedValue]);

  return (
    <FormField
      control={form.control}
      name="preferredStaffId"
      render={({ field }) => {
        // PHASE 1: Enhanced logging for field changes
        console.log('🎯 [PreferredStaffField] Field render:', {
          fieldValue: field.value,
          fieldValueType: typeof field.value,
          formValue: form.getValues('preferredStaffId'),
          timestamp: new Date().toISOString()
        });

        return (
          <FormItem>
            <FormLabel>Preferred Staff Member (Optional)</FormLabel>
            <Select
              onValueChange={(value) => {
                // PHASE 1: Enhanced logging for value changes
                console.log('🔄 [PreferredStaffField] Select onValueChange triggered:', {
                  originalValue: value,
                  willSetToNull: value === "none",
                  finalValue: value === "none" ? null : value,
                  previousFieldValue: field.value,
                  timestamp: new Date().toISOString()
                });
                
                const finalValue = value === "none" ? null : value;
                field.onChange(finalValue);
                
                // PHASE 1: Verify the change was applied
                setTimeout(() => {
                  const updatedValue = form.getValues('preferredStaffId');
                  console.log('✅ [PreferredStaffField] Value change verification:', {
                    expectedValue: finalValue,
                    actualFormValue: updatedValue,
                    changeSuccessful: updatedValue === finalValue,
                    timestamp: new Date().toISOString()
                  });
                }, 0);
              }}
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
                {staffOptions.map((staff) => {
                  // PHASE 1: Log each staff option for debugging
                  console.log('📋 [PreferredStaffField] Staff option:', {
                    id: staff.id,
                    name: staff.full_name,
                    idType: typeof staff.id
                  });
                  
                  return (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
