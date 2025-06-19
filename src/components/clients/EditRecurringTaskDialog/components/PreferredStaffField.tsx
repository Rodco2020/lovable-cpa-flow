import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EditTaskFormValues } from '../types';
import { StaffOption } from '@/types/staffOption';
import { Loader2, AlertTriangle, RotateCcw, Info } from 'lucide-react';

interface PreferredStaffFieldProps {
  form: UseFormReturn<EditTaskFormValues>;
}

/**
 * Simplified Preferred Staff Field Component
 * 
 * Uses React-Hook-Form Controller for direct form binding without complex value normalization.
 * Handles null values directly in the Select component for cleaner state management.
 * 
 * Form Value Logic:
 * - null = "No preference" (automatic assignment)
 * - string UUID = Specific staff member selection
 * 
 * Select Value Logic:
 * - "no-preference" = "No preference" option (fixes Radix UI empty string error)
 * - string UUID = Staff member option
 */
export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  const [retryAttempts, setRetryAttempts] = React.useState(0);

  // Fetch active staff members with enhanced error handling and caching
  const { 
    data: staffOptions = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery<StaffOption[]>({
    queryKey: ['staff-dropdown-options'],
    queryFn: getActiveStaffForDropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  /**
   * Retry handler for network failures
   */
  const handleRetry = async () => {
    setRetryAttempts(prev => prev + 1);
    await refetch();
  };

  /**
   * Gets staff display name by ID
   */
  const getStaffName = (staffId: string | null): string | null => {
    if (!staffId) return null;
    const staff = staffOptions.find(s => s.id === staffId);
    return staff?.full_name || null;
  };

  /**
   * Validates if staff ID exists in current options
   */
  const isValidStaffId = (staffId: string | null): boolean => {
    if (staffId === null) return true; // null is always valid (no preference)
    return staffOptions.some(staff => staff.id === staffId);
  };

  return (
    <Controller
      name="preferredStaffId"
      control={form.control}
      render={({ field, fieldState }) => {
        const currentValue = field.value;
        const selectedStaffName = getStaffName(currentValue);
        const isValidSelection = isValidStaffId(currentValue);

        // Debug logging for form state tracking
        console.log('🔍 [PreferredStaffField] Form state debug:', {
          fieldValue: field.value,
          fieldValueType: typeof field.value,
          selectedStaffName,
          isValidSelection,
          staffOptionsCount: staffOptions.length,
          timestamp: new Date().toISOString()
        });

        // Auto-recovery for invalid selections
        React.useEffect(() => {
          if (!isLoading && currentValue !== null && !isValidSelection) {
            console.log('⚠️ [PreferredStaffField] Auto-recovering invalid selection:', {
              invalidValue: currentValue,
              resettingToNull: true,
              timestamp: new Date().toISOString()
            });
            field.onChange(null);
          }
        }, [currentValue, isValidSelection, isLoading, field]);

        return (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Preferred Staff Member (Optional)
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {selectedStaffName && (
                <span className="text-xs text-green-600 font-normal">
                  ✓ {selectedStaffName} selected
                </span>
              )}
            </FormLabel>

            {/* Error state with retry functionality */}
            {error && (
              <Alert variant="destructive" className="mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Failed to load staff data: {error.message}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRefetching}
                    className="ml-2"
                  >
                    {isRefetching ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RotateCcw className="h-3 w-3 mr-1" />
                    )}
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Validation error feedback */}
            {!isValidSelection && currentValue !== null && (
              <Alert variant="destructive" className="mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Selected staff member is no longer available
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => field.onChange(null)}
                    className="ml-2 p-0 h-auto"
                  >
                    Reset to "No preference"
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Select
              onValueChange={(value) => {
                console.log('📝 [PreferredStaffField] Select onChange:', {
                  selectedValue: value,
                  selectedValueType: typeof value,
                  willSetFormTo: value === "no-preference" ? null : value,
                  timestamp: new Date().toISOString()
                });
                
                // Convert "no-preference" to null, keep UUIDs as strings
                const formValue = value === "no-preference" ? null : value;
                field.onChange(formValue);
              }}
              value={currentValue || "no-preference"} // Convert null to "no-preference" for Select
              disabled={isLoading || !!error}
            >
              <FormControl>
                <SelectTrigger className={`
                  ${isLoading ? 'opacity-70' : ''}
                  ${error ? 'border-destructive' : ''}
                  ${selectedStaffName ? 'border-green-500' : ''}
                `}>
                  <SelectValue 
                    placeholder={
                      isLoading 
                        ? "Loading staff..." 
                        : error 
                        ? "Failed to load staff" 
                        : "Select preferred staff member"
                    } 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="z-50 bg-background">
                {/* No preference option */}
                <SelectItem value="no-preference" className="font-medium">
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    No preference
                  </div>
                </SelectItem>
                
                {/* Staff options */}
                {staffOptions.map((staff) => {
                  const isCurrentSelection = staff.id === currentValue;
                  
                  return (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center gap-2">
                        {isCurrentSelection && (
                          <span className="text-green-600 text-xs">✓</span>
                        )}
                        {staff.full_name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Help text and status feedback */}
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              <p>Select a staff member to handle this task, or choose "No preference" for automatic assignment.</p>
              
              {isLoading && (
                <p className="text-blue-600 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading available staff members...
                </p>
              )}
              
              {retryAttempts > 0 && !error && (
                <p className="text-green-600">
                  ✓ Reconnected after {retryAttempts} attempt{retryAttempts > 1 ? 's' : ''}
                </p>
              )}
              
              {currentValue && isValidSelection && selectedStaffName && (
                <p className="text-green-600">
                  ✓ {selectedStaffName} will be preferred for this task
                </p>
              )}

              {/* Debug information */}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">Debug Info</summary>
                <div className="mt-1 p-2 bg-muted rounded text-xs">
                  <p>Form Value: {JSON.stringify(currentValue)}</p>
                  <p>Form Value Type: {typeof currentValue}</p>
                  <p>Select Value: {JSON.stringify(currentValue || "no-preference")}</p>
                  <p>Valid Selection: {isValidSelection.toString()}</p>
                  <p>Staff Options Count: {staffOptions.length}</p>
                </div>
              </details>
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
