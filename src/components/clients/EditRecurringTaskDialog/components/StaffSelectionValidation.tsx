
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, RotateCcw } from 'lucide-react';
import { StaffSelectionError } from '@/services/clientTask/staffSelectionErrorHandler';

interface StaffSelectionValidationProps {
  error?: StaffSelectionError | null;
  isValid: boolean;
  selectedStaffName?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onClear?: () => void;
  onRestore?: () => void;
  canRestore?: boolean;
}

export const StaffSelectionValidation: React.FC<StaffSelectionValidationProps> = ({
  error,
  isValid,
  selectedStaffName,
  isLoading,
  onRetry,
  onClear,
  onRestore,
  canRestore
}) => {
  // Success state
  if (isValid && selectedStaffName && !error) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>{selectedStaffName}</strong> will be preferred for this task.
        </AlertDescription>
      </Alert>
    );
  }

  // No selection state (also valid)
  if (isValid && !selectedStaffName && !error) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          No preference - staff will be assigned automatically based on availability and skills.
        </AlertDescription>
      </Alert>
    );
  }

  // Error state
  if (error) {
    const getAlertVariant = () => {
      switch (error.type) {
        case 'PERMISSION_ERROR':
          return 'destructive';
        case 'NOT_FOUND':
        case 'VALIDATION_ERROR':
          return 'destructive';
        case 'NETWORK_ERROR':
          return 'default';
        default:
          return 'destructive';
      }
    };

    const getIcon = () => {
      switch (error.type) {
        case 'NETWORK_ERROR':
          return <Info className="h-4 w-4" />;
        default:
          return <AlertTriangle className="h-4 w-4" />;
      }
    };

    return (
      <Alert variant={getAlertVariant()}>
        {getIcon()}
        <AlertDescription className="space-y-2">
          <div>{error.message}</div>
          
          <div className="flex flex-wrap gap-2">
            {error.retryable && onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Retry
                  </>
                )}
              </Button>
            )}
            
            {error.recoverable && onClear && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClear}
              >
                Clear Selection
              </Button>
            )}
            
            {canRestore && onRestore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRestore}
              >
                Restore Previous
              </Button>
            )}
          </div>
          
          {error.type === 'PERMISSION_ERROR' && (
            <div className="text-xs mt-2 text-muted-foreground">
              If you need access to this staff member, please contact your administrator.
            </div>
          )}
          
          {error.type === 'NETWORK_ERROR' && (
            <div className="text-xs mt-2 text-muted-foreground">
              Check your internet connection and try again.
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
