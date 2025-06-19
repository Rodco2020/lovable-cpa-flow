
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Users } from 'lucide-react';
import { EditTaskFormValues } from '../types';
import { StaffOption } from '@/types/staffOption';

interface PreferredStaffFieldProps {
  form: UseFormReturn<EditTaskFormValues>;
}

export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  // Fetch active staff members using the optimized dropdown service
  const { 
    data: staffOptions = [], 
    isLoading, 
    error,
    isError 
  } = useQuery<StaffOption[]>({
    queryKey: ['staff-dropdown-options'],
    queryFn: getActiveStaffForDropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache (renamed from cacheTime)
    retry: 2, // Retry failed requests twice
  });

  // Handle error state
  if (isError) {
    return (
      <div className="space-y-2">
        <FormLabel className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Preferred Staff Member (Optional)
        </FormLabel>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load staff members. {error instanceof Error ? error.message : 'Please try again.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="preferredStaffId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Preferred Staff Member (Optional)
          </FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
            value={field.value || "none"}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue 
                  placeholder={
                    isLoading 
                      ? "Loading staff members..." 
                      : staffOptions.length === 0 
                        ? "No staff members available"
                        : "Select preferred staff member"
                  } 
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[200px]">
              <SelectItem value="none" className="font-medium text-muted-foreground">
                No preference
              </SelectItem>
              {isLoading ? (
                <SelectItem value="loading" disabled className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading staff members...</span>
                </SelectItem>
              ) : staffOptions.length === 0 ? (
                <SelectItem value="empty" disabled className="text-muted-foreground italic">
                  No active staff members found
                </SelectItem>
              ) : (
                staffOptions.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{staff.full_name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormDescription className="text-sm text-muted-foreground">
            Optionally assign a preferred staff member for this recurring task. This helps with consistent assignment and workload planning.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
