
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SelectSourceClientStep } from './CopyTasks/SelectSourceClientStep';
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
  const [copyProgress, setCopyProgress] = useState(0);
  const [sourceClientName_internal, setSourceClientName_internal] = useState('');
  const [targetClientName, setTargetClientName] = useState('');
  const [adHocTasksCount, setAdHocTasksCount] = useState(0);
  const [recurringTasksCount, setRecurringTasksCount] = useState(0);
  const [selectedAdHocTasksCount, setSelectedAdHocTasksCount] = useState(0);
  const [selectedRecurringTasksCount, setSelectedRecurringTasksCount] = useState(0);

  // Determine the actual default source client ID (backward compatibility)
  const actualDefaultSourceClientId = defaultSourceClientId || clientId;

  // Fetch all clients for selection
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

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

  // Filter clients for source selection (all active clients)
  const availableSourceClients = Array.isArray(clients) ? 
    clients.filter((client: Client) => client.status === 'Active') : [];

  // Filter clients for target selection (exclude source client)
  const availableTargetClients = Array.isArray(clients) ? 
    clients.filter((client: Client) => 
      client.status === 'Active' && client.id !== sourceClientId
    ) : [];

  // Calculate task counts when selectedTaskIds changes
  useEffect(() => {
    setSelectedAdHocTasksCount(Math.floor(selectedTaskIds.length * 0.6));
    setSelectedRecurringTasksCount(Math.ceil(selectedTaskIds.length * 0.4));
  }, [selectedTaskIds]);

  // Mock progress update for the copying process
  useEffect(() => {
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
    
    setCopyProgress(0);
  }, [step]);

  // Update client names when IDs change
  useEffect(() => {
    if (sourceClientId && Array.isArray(clients)) {
      const client = clients.find((c: Client) => c.id === sourceClientId);
      if (client) {
        setSourceClientName_internal(client.legalName || '');
      }
    }
  }, [sourceClientId, clients]);

  useEffect(() => {
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

  // Use provided sourceClientName or internal name
  const displaySourceClientName = sourceClientName || sourceClientName_internal;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 'select-source-client' && (
          <SelectSourceClientStep 
            onSelectSourceClient={handleSelectSourceClient}
            availableClients={availableSourceClients}
            sourceClientId={sourceClientId || ''}
            setSourceClientId={(id) => handleSelectSourceClient(id)}
            isLoading={isClientsLoading}
          />
        )}

        {step === 'select-target-client' && (
          <SelectClientStep 
            sourceClientId={sourceClientId}
            onSelectClient={handleSelectTargetClient}
            availableClients={availableTargetClients}
            targetClientId={targetClientId || ''}
            setSelectedClientId={(id) => handleSelectTargetClient(id)}
            isLoading={isClientsLoading}
            stepType="target"
          />
        )}
        
        {step === 'select-tasks' && sourceClientId && targetClientId && (
          <SelectTasksStep 
            clientId={sourceClientId}
            targetClientId={targetClientId}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            step={step}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        )}
        
        {step === 'confirm' && sourceClientId && targetClientId && (
          <ConfirmationStep 
            sourceClientId={sourceClientId}
            targetClientId={targetClientId}
            sourceClientName={displaySourceClientName}
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
            sourceClientName={displaySourceClientName}
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
