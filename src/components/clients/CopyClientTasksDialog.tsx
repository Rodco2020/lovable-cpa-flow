
import React, { useState } from 'react';
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
  sourceClientName?: string;
}

const CopyClientTasksDialog: React.FC<CopyClientTasksDialogProps> = ({ 
  clientId, 
  open, 
  onOpenChange,
  sourceClientName = '' 
}) => {
  const [copyProgress, setCopyProgress] = useState(0);
  const [targetClientName, setTargetClientName] = useState('');
  const [adHocTasksCount, setAdHocTasksCount] = useState(0);
  const [recurringTasksCount, setRecurringTasksCount] = useState(0);

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

  // Mock progress update for the copying process
  React.useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setCopyProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 200);
      
      return () => clearInterval(interval);
    }
    
    // Reset progress when not in processing step
    setCopyProgress(0);
  }, [step]);

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
            sourceClientId={clientId} 
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
            sourceClientId={clientId}
            targetClientId={targetClientId}
            selectedCount={selectedTaskIds.length}
            step={step}
            handleBack={handleBack}
            handleCopy={handleCopy}
            isProcessing={isProcessing}
          />
        )}
        
        {step === 'processing' && (
          <ProcessingStep progress={copyProgress} />
        )}
        
        {step === 'success' && (
          <SuccessStep 
            sourceClientName={sourceClientName}
            targetClientName={targetClientName}
            adHocTasksCount={adHocTasksCount}
            recurringTasksCount={recurringTasksCount}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CopyClientTasksDialog;
