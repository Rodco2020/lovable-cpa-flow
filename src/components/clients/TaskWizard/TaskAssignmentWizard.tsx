
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgressIndicator } from './WizardProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { ActionSelectionStep } from './ActionSelectionStep';
import { WizardStep } from './WizardStep';
import { WizardAction } from './types';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { EnhancedClientBrowser } from './EnhancedClientBrowser';
import { SelectTasksStep } from '../CopyTasks/SelectTasksStep';
import { ConfirmationStep } from '../CopyTasks/ConfirmationStep';
import { ProcessingStep } from '../CopyTasks/ProcessingStep';
import { SuccessStep } from '../CopyTasks/SuccessStep';
import { useCopyTasksDialog } from '../CopyTasks/hooks/useCopyTasksDialog';
import { Client } from '@/types/client';

interface TaskAssignmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClientId?: string;
}

const WizardContent: React.FC<{
  onClose: () => void;
  initialClientId?: string;
}> = ({ onClose, initialClientId }) => {
  const { 
    currentStep, 
    selectedAction, 
    resetWizard, 
    setCurrentStep,
    targetClientId,
    setTargetClientId,
    selectedTaskIds,
    setSelectedTaskIds 
  } = useWizard();
  
  // Fetch clients for enhanced browser
  const { data: clients = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
  });

  // Use the existing copy dialog hook for copy operations
  const {
    step: copyStep,
    targetClientId: copyTargetClientId,
    selectedTaskIds: copySelectedTaskIds,
    setSelectedTaskIds: setCopySelectedTaskIds,
    handleSelectClient: handleCopySelectClient,
    handleBack: handleCopyBack,
    handleNext: handleCopyNext,
    handleCopy: handleCopyExecute,
    isProcessing: isCopyProcessing,
    isSuccess: isCopySuccess,
  } = useCopyTasksDialog(initialClientId || '', onClose);

  React.useEffect(() => {
    if (initialClientId) {
      setTargetClientId(initialClientId);
    }
  }, [initialClientId, setTargetClientId]);

  const handleCancel = () => {
    resetWizard();
    onClose();
  };

  const handleComplete = () => {
    resetWizard();
    onClose();
  };

  const handleActionSelect = (action: WizardAction) => {
    if (action === 'copy-from-client') {
      setCurrentStep('client-selection');
    } else {
      // For other actions, proceed to next step (placeholder for now)
      setCurrentStep('client-selection');
    }
  };

  const handleClientSelect = (clientId: string) => {
    setTargetClientId(clientId);
    if (selectedAction === 'copy-from-client') {
      handleCopySelectClient(clientId);
      setCurrentStep('task-selection');
    }
  };

  const availableClients = Array.isArray(clients) 
    ? clients.filter((client: Client) => client.id !== initialClientId) 
    : [];

  const getSourceClientName = () => {
    if (!initialClientId || !Array.isArray(clients)) return '';
    const sourceClient = clients.find((c: Client) => c.id === initialClientId);
    return sourceClient?.legalName || '';
  };

  const getTargetClientName = () => {
    if (!copyTargetClientId || !Array.isArray(clients)) return '';
    const targetClient = clients.find((c: Client) => c.id === copyTargetClientId);
    return targetClient?.legalName || '';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'action-selection':
        return (
          <ActionSelectionStep onActionSelect={handleActionSelect} />
        );
      
      case 'client-selection':
        if (selectedAction === 'copy-from-client') {
          return (
            <WizardStep 
              title="Select Target Client"
              description="Choose the client you want to copy tasks to"
            >
              <EnhancedClientBrowser
                clients={availableClients}
                onSelectClient={handleClientSelect}
                selectedClientId={copyTargetClientId || undefined}
                isLoading={isClientsLoading}
              />
            </WizardStep>
          );
        }
        return (
          <WizardStep 
            title="Select Client"
            description="Choose a client for this operation"
          >
            <div className="text-center py-8 text-muted-foreground">
              Client selection for {selectedAction?.replace('-', ' ')} will be implemented here.
            </div>
          </WizardStep>
        );

      case 'task-selection':
        if (selectedAction === 'copy-from-client' && initialClientId && copyTargetClientId) {
          return (
            <SelectTasksStep 
              clientId={initialClientId}
              targetClientId={copyTargetClientId}
              selectedTaskIds={copySelectedTaskIds}
              setSelectedTaskIds={setCopySelectedTaskIds}
              step={copyStep}
              handleBack={() => setCurrentStep('client-selection')}
              handleNext={() => setCurrentStep('confirmation')}
            />
          );
        }
        return (
          <WizardStep 
            title="Select Tasks"
            description="Choose tasks for this operation"
          >
            <div className="text-center py-8 text-muted-foreground">
              Task selection for {selectedAction?.replace('-', ' ')} will be implemented here.
            </div>
          </WizardStep>
        );

      case 'confirmation':
        if (selectedAction === 'copy-from-client' && initialClientId && copyTargetClientId) {
          const selectedAdHocCount = Math.floor(copySelectedTaskIds.length * 0.6);
          const selectedRecurringCount = Math.ceil(copySelectedTaskIds.length * 0.4);
          
          return (
            <ConfirmationStep 
              sourceClientId={initialClientId}
              targetClientId={copyTargetClientId}
              sourceClientName={getSourceClientName()}
              targetClientName={getTargetClientName()}
              selectedAdHocTaskCount={selectedAdHocCount}
              selectedRecurringTaskCount={selectedRecurringCount}
              selectedCount={copySelectedTaskIds.length}
              step={copyStep}
              handleBack={() => setCurrentStep('task-selection')}
              handleCopy={async () => {
                setCurrentStep('processing');
                await handleCopyExecute();
                setCurrentStep('success');
              }}
              isProcessing={isCopyProcessing}
            />
          );
        }
        return (
          <WizardStep 
            title="Confirm Operation"
            description="Review and confirm your selections"
          >
            <div className="text-center py-8 text-muted-foreground">
              Confirmation for {selectedAction?.replace('-', ' ')} will be implemented here.
            </div>
          </WizardStep>
        );

      case 'processing':
        if (selectedAction === 'copy-from-client') {
          return <ProcessingStep progress={isCopyProcessing ? 50 : 100} />;
        }
        return (
          <WizardStep 
            title="Processing"
            description="Your operation is being processed"
          >
            <div className="text-center py-8 text-muted-foreground">
              Processing {selectedAction?.replace('-', ' ')}...
            </div>
          </WizardStep>
        );

      case 'success':
        if (selectedAction === 'copy-from-client') {
          return (
            <SuccessStep 
              sourceClientName={getSourceClientName()}
              targetClientName={getTargetClientName()}
              adHocTasksCount={Math.floor(copySelectedTaskIds.length * 0.6)}
              recurringTasksCount={Math.ceil(copySelectedTaskIds.length * 0.4)}
            />
          );
        }
        return (
          <WizardStep 
            title="Success"
            description="Operation completed successfully"
          >
            <div className="text-center py-8 text-green-600">
              {selectedAction?.replace('-', ' ')} completed successfully!
            </div>
          </WizardStep>
        );
      
      default:
        return (
          <WizardStep 
            title="Step Under Development"
            description="This step is currently being implemented"
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  This step will be implemented in the next phase.
                </p>
                <p className="text-sm text-muted-foreground">
                  Selected Action: <span className="font-medium capitalize">
                    {selectedAction?.replace('-', ' ')}
                  </span>
                </p>
              </div>
            </div>
          </WizardStep>
        );
    }
  };

  return (
    <div className="space-y-6">
      <WizardProgressIndicator 
        currentStep={currentStep}
        selectedAction={selectedAction || undefined}
      />
      
      {renderStepContent()}
      
      <WizardNavigation 
        onCancel={handleCancel}
        onComplete={handleComplete}
      />
    </div>
  );
};

export const TaskAssignmentWizard: React.FC<TaskAssignmentWizardProps> = ({
  open,
  onOpenChange,
  initialClientId
}) => {
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <WizardProvider>
          <WizardContent 
            onClose={() => onOpenChange(false)}
            initialClientId={initialClientId}
          />
        </WizardProvider>
      </DialogContent>
    </Dialog>
  );
};
