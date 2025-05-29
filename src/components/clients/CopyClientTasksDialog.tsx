
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCopyTasksDialog } from './CopyTasks/hooks/useCopyTasksDialog';
import { useCopyDialogState } from './CopyTasks/hooks/useCopyDialogState';
import { CopyDialogStepRenderer } from './CopyTasks/CopyDialogStepRenderer';

interface CopyClientTasksDialogProps {
  clientId?: string; // Made optional for backward compatibility
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceClientName?: string;
  defaultSourceClientId?: string; // New prop for setting default source
}

const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({ 
  clientId, // Legacy prop - will be used as defaultSourceClientId if provided
  open, 
  onOpenChange,
  sourceClientName = '',
  defaultSourceClientId
}) => {
  // Determine the actual default source client ID (backward compatibility)
  const actualDefaultSourceClientId = defaultSourceClientId || clientId;

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

  // Reset the dialog when it's closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
