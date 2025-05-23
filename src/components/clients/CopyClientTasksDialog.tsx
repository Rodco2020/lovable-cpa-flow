
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SelectClientStep } from './CopyTasks/SelectClientStep';
import { SelectTasksStep } from './CopyTasks/SelectTasksStep';
import { ConfirmationStep } from './CopyTasks/ConfirmationStep';
import { ProcessingStep } from './CopyTasks/ProcessingStep';
import { SuccessStep } from './CopyTasks/SuccessStep';
import { useCopyTasksDialog } from './CopyTasks/hooks/useCopyTasksDialog';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { Client } from '@/types/client';

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
  const [selectedAdHocTasksCount, setSelectedAdHocTasksCount] = useState(0);
  const [selectedRecurringTasksCount, setSelectedRecurringTasksCount] = useState(0);

  // Fetch available clients for selection
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Filter out the source client from available clients
  const availableClients = Array.isArray(clients) ? clients.filter((client: Client) => client.id !== clientId) : [];

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

  // Calculate task counts when selectedTaskIds changes
  useEffect(() => {
    // This is a placeholder - in a real implementation you would need to 
    // check each task type to determine accurate counts
    setSelectedAdHocTasksCount(Math.floor(selectedTaskIds.length * 0.6));
    setSelectedRecurringTasksCount(Math.ceil(selectedTaskIds.length * 0.4));
  }, [selectedTaskIds]);

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

  // Find the target client name when the targetClientId changes
  React.useEffect(() => {
    if (targetClientId && Array.isArray(clients)) {
      const client = clients.find((c: Client) => c.id === targetClientId);
      if (client) {
        setTargetClientName(client.legalName || '');
      }
    }
  }, [targetClientId, clients]);

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
            availableClients={availableClients}
            targetClientId={targetClientId || ''}
            setTargetClientId={(id) => handleSelectClient(id)}
            isLoading={isClientsLoading}
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
            sourceClientName={sourceClientName}
            targetClientName={targetClientName}
            selectedAdHocTaskCount={selectedAdHocTasksCount}
            selectedRecurringTaskCount={selectedRecurringTasksCount}
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
