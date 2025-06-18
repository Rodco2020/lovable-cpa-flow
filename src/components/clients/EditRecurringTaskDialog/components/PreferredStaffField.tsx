
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

export const PreferredStaffField: React.FC<PreferredStaffFieldProps> = ({ form }) => {
  const [retryAttempts, setRetryAttempts] = React.useState(0);
  const [userHasInteracted, setUserHasInteracted] = React.useState(false);
  const [lastValidSelection, setLastValidSelection] = React.useState<string | null>(null);

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
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // PHASE 4: Enhanced value handling with better error recovery
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

  // PHASE 4: Enhanced validation with better error feedback
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

  // PHASE 4: Retry handler with user feedback
  const handleRetry = async () => {
    console.log('🔄 [PreferredStaffField] Retrying staff data fetch:', {
      attempt: retryAttempts + 1,
      timestamp: new Date().toISOString()
    });
    
    setRetryAttempts(prev => prev + 1);
    await refetch();
  };

  // PHASE 4: Enhanced effect for auto-recovery and persistence
  React.useEffect(() => {
    const currentValue = form.getValues('preferredStaffId');
    console.log('🔍 [PreferredStaffField] PHASE 4 - Component state updated:', {
      currentFormValue: currentValue,
      normalizedValue: normalizeValue(currentValue),
      staffOptionsCount: staffOptions.length,
      isLoading,
      error: error?.message,
      userHasInteracted,
      lastValidSelection,
      timestamp: new Date().toISOString()
    });

    // Track last valid selection for recovery
    if (currentValue && validateStaffId(currentValue).isValid) {
      setLastValidSelection(currentValue);
    }
  }, [form, staffOptions, isLoading, error, userHasInteracted, lastValidSelection]);

  // PHASE 4: Get staff name for better user feedback
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

        console.log('🎯 [PreferredStaffField] Field render - PHASE 4:', {
          fieldValue: currentValue,
          normalizedSelectValue,
          validation,
          selectedStaffName,
          isLoading,
          error: error?.message,
          timestamp: new Date().toISOString()
        });

        // PHASE 4: Auto-recovery for invalid selections
        React.useEffect(() => {
          if (!isLoading && currentValue !== null && !validation.isValid && userHasInteracted) {
            console.log('⚠️ [PreferredStaffField] PHASE 4 - Auto-recovery triggered:', {
              invalidValue: currentValue,
              lastValidSelection,
              willResetTo: lastValidSelection || null,
              timestamp: new Date().toISOString()
            });
            
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

            {/* PHASE 4: Error state with retry functionality */}
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

            {/* PHASE 4: Validation error feedback */}
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
                console.log('🔄 [PreferredStaffField] PHASE 4 - Select onValueChange:', {
                  selectValue: value,
                  willDenormalizeTo: denormalizeValue(value),
                  previousFieldValue: currentValue,
                  isValidSelection: value === "none" || staffOptions.some(s => s.id === value),
                  timestamp: new Date().toISOString()
                });
                
                setUserHasInteracted(true);
                const denormalizedValue = denormalizeValue(value);
                
                // PHASE 4: Enhanced validation before setting value
                if (denormalizedValue !== null && !staffOptions.some(s => s.id === denormalizedValue)) {
                  console.error('❌ [PreferredStaffField] PHASE 4 - Invalid staff selection attempted:', {
                    attemptedValue: denormalizedValue,
                    availableOptions: staffOptions.map(s => s.id),
                    timestamp: new Date().toISOString()
                  });
                  return; // Don't update if invalid
                }
                
                field.onChange(denormalizedValue);
                
                // PHASE 4: Update last valid selection
                if (denormalizedValue && validateStaffId(denormalizedValue).isValid) {
                  setLastValidSelection(denormalizedValue);
                }
                
                // PHASE 4: Enhanced verification with user feedback
                setTimeout(() => {
                  const updatedValue = form.getValues('preferredStaffId');
                  const changeSuccessful = updatedValue === denormalizedValue;
                  console.log('✅ [PreferredStaffField] PHASE 4 - Value change verification:', {
                    expectedValue: denormalizedValue,
                    actualFormValue: updatedValue,
                    changeSuccessful,
                    timestamp: new Date().toISOString()
                  });
                  
                  if (!changeSuccessful) {
                    console.error('💥 [PreferredStaffField] PHASE 4 - Form value update failed!');
                  }
                }, 0);
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
                  console.log('📋 [PreferredStaffField] PHASE 4 - Staff option rendered:', {
                    id: staff.id,
                    name: staff.full_name,
                    isCurrentSelection,
                    idType: typeof staff.id
                  });
                  
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

            {/* PHASE 4: Enhanced help text and status feedback */}
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

            {/* PHASE 4: Enhanced form validation message */}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
