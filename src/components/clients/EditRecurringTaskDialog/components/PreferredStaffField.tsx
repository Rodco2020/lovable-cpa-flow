
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
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
 * Preferred Staff Field Component
 * 
 * Provides a dropdown selector for assigning a preferred staff member to a task.
 * This is an optional field that allows clients to request specific staff members
 * for their recurring tasks while maintaining the flexibility to choose "No preference"
 * for automatic assignment.
 * 
 * Features:
 * - Fetches active staff members from the database
 * - Handles loading, error, and retry states gracefully
 * - Validates staff selections and provides feedback
 * - Supports "No preference" option for automatic assignment
 * - Auto-recovery for invalid selections
 * - Accessibility compliant with proper ARIA labels
 * - Real-time form integration with react-hook-form
 * 
 * Value Handling:
 * - Form stores null for "No preference" (automatic assignment)
 * - Form stores staff UUID string for specific staff selections
 * - Component normalizes values for Select component compatibility
 * - Validates selections against current staff list
 * 
 * Error Recovery:
 * - Automatically resets invalid staff IDs to last valid selection or null
 * - Provides retry functionality for network failures
 * - Graceful degradation when staff data is unavailable
 */
export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  const [retryAttempts, setRetryAttempts] = React.useState(0);
  const [userHasInteracted, setUserHasInteracted] = React.useState(false);
  const [lastValidSelection, setLastValidSelection] = React.useState<string | null>(null);

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
   * Normalizes form values for Select component compatibility
   * Converts null/undefined to "none" string for Select component
   */
  const normalizeValue = (value: string | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return "none";
    }
    return value;
  };

  /**
   * Denormalizes Select values back to form values
   * Converts "none" string back to null for form storage
   */
  const denormalizeValue = (selectValue: string): string | null => {
    if (selectValue === "none" || selectValue === '' || selectValue === undefined) {
      return null;
    }
    return selectValue;
  };

  /**
   * Validates staff ID against current staff list
   * Returns validation result with error message if invalid
   */
  const validateStaffId = (staffId: string | null): { isValid: boolean; errorMessage?: string } => {
    if (staffId === null) return { isValid: true }; // null is valid (no preference)
    
    if (staffOptions.length === 0 && !isLoading) {
      return { isValid: false, errorMessage: "Staff data is not available" };
    }
    
    const staffExists = staffOptions.some(staff => staff.id === staffId);
    if (!staffExists) {
      return { 
        isValid: false, 
        errorMessage: "Selected staff member is no longer available" 
      };
    }
    
    return { isValid: true };
  };

  /**
   * Retry handler for network failures
   * Increments retry counter and refetches data
   */
  const handleRetry = async () => {
    setRetryAttempts(prev => prev + 1);
    await refetch();
  };

  /**
   * Effect for tracking valid selections and auto-recovery
   * Maintains last valid selection for recovery purposes
   */
  React.useEffect(() => {
    const currentValue = form.getValues('preferredStaffId');
    
    // Track last valid selection for recovery
    if (currentValue && validateStaffId(currentValue).isValid) {
      setLastValidSelection(currentValue);
    }
  }, [form, staffOptions, isLoading, error, userHasInteracted, lastValidSelection]);

  /**
   * Gets staff display name by ID
   * Returns staff name or null if not found
   */
  const getStaffName = (staffId: string | null): string | null => {
    if (!staffId) return null;
    const staff = staffOptions.find(s => s.id === staffId);
    return staff?.full_name || null;
  };

  return (
    <FormField
      control={form.control}
      name="preferredStaffId"
      render={({ field }) => {
        const currentValue = field.value;
        const normalizedSelectValue = normalizeValue(currentValue);
        const validation = validateStaffId(currentValue);
        const selectedStaffName = getStaffName(currentValue);

        /**
         * Auto-recovery effect for invalid selections
         * Automatically resets to last valid selection or null
         */
        React.useEffect(() => {
          if (!isLoading && currentValue !== null && !validation.isValid && userHasInteracted) {
            // Try to recover with last valid selection, otherwise reset to null
            field.onChange(lastValidSelection || null);
          }
        }, [currentValue, validation.isValid, isLoading, field, lastValidSelection, userHasInteracted]);

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
            {!validation.isValid && validation.errorMessage && (
              <Alert variant="destructive" className="mb-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validation.errorMessage}
                  {lastValidSelection && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        field.onChange(lastValidSelection);
                        setUserHasInteracted(true);
                      }}
                      className="ml-2 p-0 h-auto"
                    >
                      Restore previous selection
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Select
              onValueChange={(value) => {
                setUserHasInteracted(true);
                const denormalizedValue = denormalizeValue(value);
                
                // Validate selection before updating form
                if (denormalizedValue !== null && !staffOptions.some(s => s.id === denormalizedValue)) {
                  return; // Don't update if invalid
                }
                
                field.onChange(denormalizedValue);
                
                // Update last valid selection
                if (denormalizedValue && validateStaffId(denormalizedValue).isValid) {
                  setLastValidSelection(denormalizedValue);
                }
              }}
              value={normalizedSelectValue}
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
                <SelectItem value="none" className="font-medium">
                  <div className="flex items-center gap-2">
                    <Info className="h-3 w-3 text-muted-foreground" />
                    No preference
                  </div>
                </SelectItem>
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
              
              {currentValue && validation.isValid && selectedStaffName && (
                <p className="text-green-600">
                  ✓ {selectedStaffName} will be preferred for this task
                </p>
              )}
            </div>

            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
