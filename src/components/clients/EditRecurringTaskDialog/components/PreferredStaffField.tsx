
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

  // PHASE 2: Enhanced value handling with proper null/undefined management
  const normalizeValue = (value: string | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return "none";
    }
    return value;
  };

  const denormalizeValue = (selectValue: string): string | null => {
    if (selectValue === "none" || selectValue === '' || selectValue === undefined) {
      return null;
    }
    return selectValue;
  };

  // PHASE 2: Validation helper to ensure staff ID exists in options
  const validateStaffId = (staffId: string | null): boolean => {
    if (staffId === null) return true; // null is valid (no preference)
    return staffOptions.some(staff => staff.id === staffId);
  };

  // PHASE 2: Enhanced logging for diagnostic purposes (to be removed after Phase 1 complete)
  React.useEffect(() => {
    const currentValue = form.getValues('preferredStaffId');
    console.log('🔍 [PreferredStaffField] Component mounted/updated:', {
      currentFormValue: currentValue,
      normalizedValue: normalizeValue(currentValue),
      staffOptionsCount: staffOptions.length,
      isValid: validateStaffId(currentValue),
      isLoading,
      timestamp: new Date().toISOString()
    });
  }, [form, staffOptions, isLoading]);

  return (
    <FormField
      control={form.control}
      name="preferredStaffId"
      render={({ field }) => {
        // PHASE 2: Enhanced field value validation and normalization
        const currentValue = field.value;
        const normalizedSelectValue = normalizeValue(currentValue);
        const isValidValue = validateStaffId(currentValue);

        console.log('🎯 [PreferredStaffField] Field render - Phase 2:', {
          fieldValue: currentValue,
          normalizedSelectValue,
          isValidValue,
          fieldValueType: typeof currentValue,
          timestamp: new Date().toISOString()
        });

        // PHASE 2: If current value is invalid, reset to null
        React.useEffect(() => {
          if (!isLoading && currentValue !== null && !isValidValue) {
            console.log('⚠️ [PreferredStaffField] Invalid staff ID detected, resetting to null:', {
              invalidValue: currentValue,
              availableOptions: staffOptions.map(s => s.id),
              timestamp: new Date().toISOString()
            });
            field.onChange(null);
          }
        }, [currentValue, isValidValue, isLoading, field, staffOptions]);

        return (
          <FormItem>
            <FormLabel>Preferred Staff Member (Optional)</FormLabel>
            <Select
              onValueChange={(value) => {
                // PHASE 2: Enhanced value change handling with validation
                console.log('🔄 [PreferredStaffField] Select onValueChange - Phase 2:', {
                  selectValue: value,
                  willDenormalizeTo: denormalizeValue(value),
                  previousFieldValue: currentValue,
                  isValidSelection: value === "none" || staffOptions.some(s => s.id === value),
                  timestamp: new Date().toISOString()
                });
                
                const denormalizedValue = denormalizeValue(value);
                
                // PHASE 2: Additional validation before setting value
                if (denormalizedValue !== null && !staffOptions.some(s => s.id === denormalizedValue)) {
                  console.error('❌ [PreferredStaffField] Invalid staff selection attempted:', {
                    attemptedValue: denormalizedValue,
                    availableOptions: staffOptions.map(s => s.id),
                    timestamp: new Date().toISOString()
                  });
                  return; // Don't update if invalid
                }
                
                field.onChange(denormalizedValue);
                
                // PHASE 2: Verify the change was applied correctly
                setTimeout(() => {
                  const updatedValue = form.getValues('preferredStaffId');
                  const changeSuccessful = updatedValue === denormalizedValue;
                  console.log('✅ [PreferredStaffField] Value change verification - Phase 2:', {
                    expectedValue: denormalizedValue,
                    actualFormValue: updatedValue,
                    changeSuccessful,
                    timestamp: new Date().toISOString()
                  });
                  
                  if (!changeSuccessful) {
                    console.error('💥 [PreferredStaffField] Form value update failed!');
                  }
                }, 0);
              }}
              value={normalizedSelectValue}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue 
                    placeholder={isLoading ? "Loading staff..." : "Select preferred staff member"} 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {staffOptions.map((staff) => {
                  // PHASE 2: Enhanced staff option logging with validation
                  console.log('📋 [PreferredStaffField] Staff option - Phase 2:', {
                    id: staff.id,
                    name: staff.full_name,
                    idType: typeof staff.id,
                    isCurrentSelection: staff.id === currentValue
                  });
                  
                  return (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.full_name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {/* PHASE 2: Enhanced form validation message */}
            <FormMessage />
            {!isValidValue && currentValue !== null && (
              <p className="text-sm text-destructive mt-1">
                Selected staff member is no longer available. Please select a different option.
              </p>
            )}
          </FormItem>
        );
      }}
    />
  );
};
