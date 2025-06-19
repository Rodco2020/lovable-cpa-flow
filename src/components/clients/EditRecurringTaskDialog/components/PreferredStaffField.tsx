
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
 * Simplified Preferred Staff Field Component with Enhanced Error Handling
 */
export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  const [retryAttempts, setRetryAttempts] = React.useState(0);
  const [isFieldReady, setIsFieldReady] = React.useState(false);

  // Fetch active staff members with enhanced error handling
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
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Initialize field readiness after data loads
  React.useEffect(() => {
    if (!isLoading && !error) {
      setIsFieldReady(true);
    }
  }, [isLoading, error]);

  const handleRetry = React.useCallback(async () => {
    setRetryAttempts(prev => prev + 1);
    await refetch();
  }, [refetch]);

  const getStaffName = React.useCallback((staffId: string | null): string | null => {
    if (!staffId) return null;
    const staff = staffOptions.find(s => s.id === staffId);
    return staff?.full_name || null;
  }, [staffOptions]);

  const isValidStaffId = React.useCallback((staffId: string | null): boolean => {
    if (staffId === null) return true;
    return staffOptions.some(staff => staff.id === staffId);
  }, [staffOptions]);

  // Show loading state while initializing
  if (!isFieldReady && isLoading) {
    return (
      <FormItem>
        <FormLabel>Preferred Staff Member (Optional)</FormLabel>
        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading staff options...</span>
        </div>
      </FormItem>
    );
  }

  // Show error state if data failed to load
  if (error && !isFieldReady) {
    return (
      <FormItem>
        <FormLabel>Preferred Staff Member (Optional)</FormLabel>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load staff data: {error.message}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRefetching}
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
      </FormItem>
    );
  }

  return (
    <Controller
      name="preferredStaffId"
      control={form.control}
      render={({ field, fieldState }) => {
        const currentValue = field.value;
        const selectedStaffName = getStaffName(currentValue);
        const isValidSelection = isValidStaffId(currentValue);

        // Auto-recovery for invalid selections
        React.useEffect(() => {
          if (currentValue !== null && !isValidSelection && staffOptions.length > 0) {
            console.log('⚠️ [PreferredStaffField] Auto-recovering invalid selection:', {
              invalidValue: currentValue,
              resettingToNull: true
            });
            field.onChange(null);
          }
        }, [currentValue, isValidSelection, staffOptions.length, field]);

        return (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Preferred Staff Member (Optional)
              {selectedStaffName && (
                <span className="text-xs text-green-600 font-normal">
                  ✓ {selectedStaffName} selected
                </span>
              )}
            </FormLabel>

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
                  willSetFormTo: value === "no-preference" ? null : value
                });
                
                const formValue = value === "no-preference" ? null : value;
                field.onChange(formValue);
              }}
              value={currentValue || "no-preference"}
              disabled={isLoading || !!error}
            >
              <FormControl>
                <SelectTrigger className={`
                  ${isLoading ? 'opacity-70' : ''}
                  ${error ? 'border-destructive' : ''}
                  ${selectedStaffName ? 'border-green-500' : ''}
                `}>
                  <SelectValue 
                    placeholder="Select preferred staff member"
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

            <div className="text-xs text-muted-foreground mt-1">
              <p>Select a staff member to handle this task, or choose "No preference" for automatic assignment.</p>
              
              {retryAttempts > 0 && !error && (
                <p className="text-green-600 mt-1">
                  ✓ Reconnected after {retryAttempts} attempt{retryAttempts > 1 ? 's' : ''}
                </p>
              )}
              
              {currentValue && isValidSelection && selectedStaffName && (
                <p className="text-green-600 mt-1">
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
