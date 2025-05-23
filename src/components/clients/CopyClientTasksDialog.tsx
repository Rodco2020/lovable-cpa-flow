
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SelectClientStep } from './CopyTasks/SelectClientStep';
import { SelectTasksStep } from './CopyTasks/SelectTasksStep';
import { ConfirmationStep } from './CopyTasks/ConfirmationStep';
import { ProcessingStep } from './CopyTasks/ProcessingStep';
import { SuccessStep } from './CopyTasks/SuccessStep';
import { useCopyTasksDialog } from './CopyTasks/hooks/useCopyTasksDialog';

interface CopyClientTasksDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({ 
  clientId, 
  open, 
  onOpenChange 
}) => {
  const {
    step,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectClient,
    handleBack,
    handleNext,
    handleCopy,
    isProcessing,
    isSuccess,
    resetDialog
  } = useCopyTasksDialog(clientId, () => onOpenChange(false));

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
        {step === 'select-client' && (
          <SelectClientStep 
            currentClientId={clientId} 
            onSelectClient={handleSelectClient} 
          />
        )}
        
        {step === 'select-tasks' && targetClientId && (
          <SelectTasksStep 
            clientId={clientId}
            targetClientId={targetClientId}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            step={step}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        )}
        
        {step === 'confirm' && targetClientId && (
          <ConfirmationStep 
            clientId={clientId}
            targetClientId={targetClientId}
            selectedCount={selectedTaskIds.length}
            step={step}
            handleBack={handleBack}
            handleCopy={handleCopy}
            isProcessing={isProcessing}
          />
        )}
        
        {step === 'processing' && (
          <ProcessingStep />
        )}
        
        {step === 'success' && (
          <SuccessStep 
            taskCount={selectedTaskIds.length} 
            onClose={() => handleOpenChange(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
