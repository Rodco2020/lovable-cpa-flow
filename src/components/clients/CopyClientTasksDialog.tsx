
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SelectClientStep } from './CopyTasks/SelectClientStep';
import { SelectTasksStep } from './CopyTasks/SelectTasksStep';
import { ConfirmationStep } from './CopyTasks/ConfirmationStep';
import { ProcessingStep } from './CopyTasks/ProcessingStep';
import { SuccessStep } from './CopyTasks/SuccessStep';
import { CopyTasksDialogFooter } from './CopyTasks/DialogFooter';
import { useCopyTasksDialog } from './CopyTasks/hooks/useCopyTasksDialog';

interface CopyClientTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceClientId: string;
  sourceClientName: string;
}

/**
 * Dialog component for copying tasks from one client to another.
 * 
 * Features:
 * - Select target client to copy to
 * - Choose which tasks to copy (ad-hoc and/or recurring)
 * - Filter tasks by priority
 * - View task details before copying
 * - Progress indicator during copy operation
 * - Success/error feedback
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
    clientsLoading,
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
    handleFinish
  } = useCopyTasksDialog(isOpen, onClose, sourceClientId, sourceClientName);

  const renderStepContent = () => {
    switch (step) {
      case 'select-client':
        return (
          <SelectClientStep 
            availableClients={availableClients}
            clientsLoading={clientsLoading}
            targetClientId={targetClientId}
            setTargetClientId={setTargetClientId}
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
            targetClient={targetClient}
            selectedAdHocTaskIds={selectedAdHocTaskIds}
            selectedRecurringTaskIds={selectedRecurringTaskIds}
          />
        );
      case 'processing':
        return (
          <ProcessingStep copyProgress={copyProgress} />
        );
      case 'success':
        return (
          <SuccessStep
            copyResults={copyResults}
            targetClientName={targetClient?.legalName}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className={`sm:max-w-${step === 'processing' || step === 'success' ? 'sm' : 'md'}`}>
        <DialogHeader>
          <DialogTitle>Copy Client Tasks</DialogTitle>
          <DialogDescription>
            Copy tasks from {sourceClientName} to another client
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
        
        <CopyTasksDialogFooter
          step={step}
          onBack={handleBack}
          onNext={handleNext}
          onClose={onClose}
          onCopy={handleCopy}
          onFinish={handleFinish}
          isCopying={isCopying}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
