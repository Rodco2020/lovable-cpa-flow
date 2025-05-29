
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
 * Enhanced Copy Client Tasks Dialog
 * 
 * Provides a workflow for copying tasks between clients with:
 * - Backward compatibility with existing usage patterns
 * - Enhanced validation and error handling
 * - Proper type safety throughout the workflow
 * - Integration with the service layer
 * - Production monitoring and performance optimization
 */
const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({ 
  clientId, // Legacy prop - maintained for backward compatibility
  open, 
  onOpenChange,
  sourceClientName = '',
  defaultSourceClientId
}) => {
  // Determine the actual default source client ID with validation
  const actualDefaultSourceClientId = React.useMemo(() => {
    const sourceId = defaultSourceClientId || clientId;
    
    // Validate that we have a valid source client ID
    if (!sourceId || typeof sourceId !== 'string' || sourceId.trim() === '') {
      console.warn('CopyClientTasksDialog: No valid source client ID provided');
      return '';
    }
    
    return sourceId;
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
    canGoNext
  } = useCopyTasksDialog(actualDefaultSourceClientId, () => onOpenChange(false));

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

  // Validation check for required props
  React.useEffect(() => {
    if (open && !actualDefaultSourceClientId) {
      console.error('CopyClientTasksDialog: Dialog opened without valid source client ID');
    }
  }, [open, actualDefaultSourceClientId]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <AnalyticsProvider>
          <MonitoringWrapper componentName="CopyClientTasksDialog" operationId={sourceClientId || ''}>
            <ErrorBoundary onError={(error) => console.error('Copy Tasks Dialog Error:', error)}>
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
