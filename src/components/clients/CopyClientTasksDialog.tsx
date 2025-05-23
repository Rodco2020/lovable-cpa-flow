
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Client } from '@/types/client';
import { useCopyTasksDialog } from './CopyTasks/hooks/useCopyTasksDialog';
import { SelectClientStep } from './CopyTasks/SelectClientStep';
import { SelectTasksStep } from './CopyTasks/SelectTasksStep';
import { ConfirmationStep } from './CopyTasks/ConfirmationStep';
import { ProcessingStep } from './CopyTasks/ProcessingStep';
import { SuccessStep } from './CopyTasks/SuccessStep';
import { DialogFooter } from './CopyTasks/DialogFooter';

interface CopyClientTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceClientId: string;
  sourceClientName: string;
}

/**
 * Dialog component for copying tasks from one client to another.
 * 
 * Phase 1: Basic dialog with client selection
 * Phase 2: Task selection with filters and multi-select functionality
 * Phase 3: Task copying service functions
 * Phase 4: Progress and feedback UI
 * Phase 5: Final integration and testing
 */
const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({
  isOpen,
  onClose,
  sourceClientId,
  sourceClientName,
}) => {
  const {
    step,
    targetClientId,
    setTargetClientId,
    activeTab,
    setActiveTab,
    isCopying,
    copyProgress,
    filterPriority,
    setFilterPriority,
    selectedAdHocTaskIds,
    selectedRecurringTaskIds,
    copyResults,
    clients,
    clientsLoading,
    clientsError,
    availableClients,
    adHocTasks,
    adHocLoading,
    adHocError,
    recurringTasks,
    recurringLoading,
    recurringError,
    filteredAdHocTasks,
    filteredRecurringTasks,
    targetClient,
    totalSelectedTasks,
    toggleAdHocTask,
    toggleRecurringTask,
    selectAllAdHocTasks,
    selectAllRecurringTasks,
    handleNext,
    handleBack,
    handleCopy,
    handleFinish,
    copyError
  } = useCopyTasksDialog(isOpen, onClose, sourceClientId, sourceClientName);

  // Early return for error states
  const renderError = (errorMessage: string) => (
    <div className="py-6 text-center text-red-600">
      <p>{errorMessage}</p>
      <p className="mt-2 text-sm text-gray-500">Please try again or contact support.</p>
    </div>
  );

  // Render step content based on current step
  const renderStepContent = () => {
    // Check for critical errors
    if (clientsError && step === 'select-client') {
      return renderError('Failed to load available clients.');
    }

    if ((adHocError || recurringError) && step === 'select-tasks') {
      return renderError('Failed to load tasks from the source client.');
    }

    if (copyError && step === 'processing') {
      return renderError(`Failed to copy tasks: ${copyError}`);
    }

    // Render the appropriate step content
    switch (step) {
      case 'select-client':
        return (
          <SelectClientStep
            availableClients={availableClients}
            targetClientId={targetClientId}
            setTargetClientId={setTargetClientId}
            isLoading={clientsLoading}
          />
        );
      case 'select-tasks':
        return (
          <SelectTasksStep
            sourceClientName={sourceClientName}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            totalSelectedTasks={totalSelectedTasks}
            filteredAdHocTasks={filteredAdHocTasks}
            adHocTasks={adHocTasks}
            selectedAdHocTaskIds={selectedAdHocTaskIds}
            toggleAdHocTask={toggleAdHocTask}
            selectAllAdHocTasks={selectAllAdHocTasks}
            adHocLoading={adHocLoading}
            adHocError={adHocError}
            filteredRecurringTasks={filteredRecurringTasks}
            recurringTasks={recurringTasks}
            selectedRecurringTaskIds={selectedRecurringTaskIds}
            toggleRecurringTask={toggleRecurringTask}
            selectAllRecurringTasks={selectAllRecurringTasks}
            recurringLoading={recurringLoading}
            recurringError={recurringError}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationStep
            sourceClientName={sourceClientName}
            targetClientName={targetClient?.legalName || ''}
            selectedAdHocTaskCount={selectedAdHocTaskIds.size}
            selectedRecurringTaskCount={selectedRecurringTaskIds.size}
          />
        );
      case 'processing':
        return <ProcessingStep progress={copyProgress} />;
      case 'success':
        return (
          <SuccessStep
            sourceClientName={sourceClientName}
            targetClientName={targetClient?.legalName || ''}
            adHocTasksCount={copyResults?.adHoc.length || 0}
            recurringTasksCount={copyResults?.recurring.length || 0}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Copy Client Tasks</DialogTitle>
          <DialogDescription>
            Copy tasks from {sourceClientName} to another client
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
        
        <DialogFooter
          step={step}
          handleBack={handleBack}
          handleNext={handleNext}
          handleCopy={handleCopy}
          handleClose={onClose}
          handleFinish={handleFinish}
          isNextDisabled={
            (step === 'select-client' && !targetClientId) || 
            (step === 'select-tasks' && totalSelectedTasks === 0) ||
            !!copyError
          }
          isCopying={isCopying}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
