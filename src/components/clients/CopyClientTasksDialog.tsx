
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCopyTasksDialog } from './CopyTasks/hooks/useCopyTasksDialog';
import { useCopyDialogState } from './CopyTasks/hooks/useCopyDialogState';
import { CopyDialogStepRenderer } from './CopyTasks/CopyDialogStepRenderer';
import { ErrorBoundary } from './CopyTasks/ErrorBoundary';
import { AnalyticsProvider } from './CopyTasks/AnalyticsProvider';
import { MonitoringWrapper } from './CopyTasks/MonitoringWrapper';

interface CopyClientTasksDialogProps {
  /** The client ID to use as the default source (backward compatibility) */
  clientId?: string;
  /** Controls the dialog open/close state */
  open: boolean;
  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;
  /** Display name of the source client (for UI purposes) */
  sourceClientName?: string;
  /** Preferred way to set default source client ID */
  defaultSourceClientId?: string;
}

/**
 * Enhanced Copy Client Tasks Dialog - Now with 6-step workflow
 * 
 * The dialog always starts with source client selection to provide a complete
 * and consistent user experience. The workflow includes:
 * 1. Select Source Client
 * 2. Select Target Client  
 * 3. Select Tasks
 * 4. Confirm Operation
 * 5. Processing
 * 6. Success
 */
const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({ 
  clientId, // Legacy prop - maintained for backward compatibility
  open, 
  onOpenChange,
  sourceClientName = '',
  defaultSourceClientId
}) => {
  // Store the default source for pre-selection but don't auto-advance
  const preferredSourceClientId = React.useMemo(() => {
    return defaultSourceClientId || clientId || '';
  }, [defaultSourceClientId, clientId]);

  const {
    step,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectSourceClient,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    isProcessing,
    isSuccess,
    resetDialog,
    canGoNext,
    validationErrors
  } = useCopyTasksDialog(undefined, () => onOpenChange(false)); // No auto-advance

  const {
    copyProgress,
    sourceClientName_internal,
    targetClientName,
    adHocTasksCount,
    recurringTasksCount,
    selectedAdHocTasksCount,
    selectedRecurringTasksCount,
    clients,
    isClientsLoading,
    availableSourceClients,
    availableTargetClients,
    displaySourceClientName
  } = useCopyDialogState(
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    sourceClientName,
    step
  );

  // Enhanced dialog state management with validation
  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  }, [resetDialog, onOpenChange]);

  // Pre-select the preferred source client when dialog opens
  React.useEffect(() => {
    if (open && preferredSourceClientId && !sourceClientId && step === 'select-source-client') {
      console.log('Pre-selecting source client:', preferredSourceClientId);
      handleSelectSourceClient(preferredSourceClientId);
    }
  }, [open, preferredSourceClientId, sourceClientId, step, handleSelectSourceClient]);

  // Show validation errors
  React.useEffect(() => {
    if (validationErrors.length > 0) {
      console.warn('Copy dialog validation errors:', validationErrors);
    }
  }, [validationErrors]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <AnalyticsProvider>
          <MonitoringWrapper componentName="CopyClientTasksDialog" operationId={sourceClientId || ''}>
            <ErrorBoundary onError={(error) => console.error('Copy Tasks Dialog Error:', error)}>
              {/* Show validation errors */}
              {validationErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm text-red-600">
                    {validationErrors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <CopyDialogStepRenderer
                step={step}
                sourceClientId={sourceClientId}
                targetClientId={targetClientId}
                selectedTaskIds={selectedTaskIds}
                availableSourceClients={availableSourceClients}
                availableTargetClients={availableTargetClients}
                isClientsLoading={isClientsLoading}
                copyProgress={copyProgress}
                displaySourceClientName={displaySourceClientName}
                targetClientName={targetClientName}
                selectedAdHocTasksCount={selectedAdHocTasksCount}
                selectedRecurringTasksCount={selectedRecurringTasksCount}
                adHocTasksCount={adHocTasksCount}
                recurringTasksCount={recurringTasksCount}
                isProcessing={isProcessing}
                handleSelectSourceClient={handleSelectSourceClient}
                handleSelectTargetClient={handleSelectTargetClient}
                handleBack={handleBack}
                handleNext={handleNext}
                handleCopy={handleCopy}
                setSelectedTaskIds={setSelectedTaskIds}
              />
            </ErrorBoundary>
          </MonitoringWrapper>
        </AnalyticsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
