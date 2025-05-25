
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizardProvider, useWizard } from './WizardContext';
import { WizardProgressIndicator } from './WizardProgressIndicator';
import { WizardNavigation } from './WizardNavigation';
import { ActionSelectionStep } from './ActionSelectionStep';
import { WizardStep } from './WizardStep';
import { useQuery } from '@tanstack/react-query';
import { getAllClients } from '@/services/clientService';
import { AssignmentConfig } from './AssignmentConfiguration';
import { useCopyTasksDialog } from '../CopyTasks/hooks/useCopyTasksDialog';
import { Client } from '@/types/client';
import { CopyFromClientSteps } from './steps/CopyFromClientSteps';
import { TemplateAssignmentSteps } from './steps/TemplateAssignmentSteps';
import { TemplateBuilderSteps } from './steps/TemplateBuilderSteps';
import { useWizardHandlers } from './hooks/useWizardHandlers';

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
    setCurrentStep,
    targetClientId,
    setTargetClientId,
    selectedTaskIds,
    setSelectedTaskIds 
  } = useWizard();
  
  // Template assignment state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assignmentConfig, setAssignmentConfig] = useState<AssignmentConfig>({
    assignmentType: 'ad-hoc',
    customizePerClient: false
  });
  const [isAssignmentProcessing, setIsAssignmentProcessing] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

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
    handleCopy: handleCopyExecute,
    isProcessing: isCopyProcessing,
    isSuccess: isCopySuccess
  } = useCopyTasksDialog(initialClientId || '', onClose);

  // Memoized effect to set initial target client ID - fixes infinite loop
  useEffect(() => {
    if (initialClientId && !targetClientId) {
      setTargetClientId(initialClientId);
    }
  }, [initialClientId, targetClientId, setTargetClientId]);

  // Monitor copy success and transition wizard step
  useEffect(() => {
    if (isCopySuccess && currentStep === 'processing') {
      console.log('Copy operation completed successfully, transitioning to success step');
      setCurrentStep('success');
    }
  }, [isCopySuccess, currentStep, setCurrentStep]);

  const {
    handleActionSelect,
    handleClientSelect,
    handleTemplateAssignmentExecute,
    handleTemplateCreated
  } = useWizardHandlers({
    selectedAction,
    setCurrentStep,
    setTargetClientId,
    handleCopySelectClient,
    setIsAssignmentProcessing,
    setAssignmentSuccess,
    selectedTemplateIds,
    selectedClientIds,
    assignmentConfig
  });

  const getSourceClientName = useCallback(() => {
    if (!initialClientId || !Array.isArray(clients)) return '';
    const sourceClient = clients.find((c: Client) => c.id === initialClientId);
    return sourceClient?.legalName || '';
  }, [initialClientId, clients]);

  const getTargetClientName = useCallback(() => {
    if (!copyTargetClientId || !Array.isArray(clients)) return '';
    const targetClient = clients.find((c: Client) => c.id === copyTargetClientId);
    return targetClient?.legalName || '';
  }, [copyTargetClientId, clients]);

  // Enhanced copy execution with proper step management
  const handleEnhancedCopyExecute = useCallback(async () => {
    try {
      console.log('Starting copy operation...');
      setCurrentStep('processing');
      await handleCopyExecute();
      console.log('Copy operation initiated');
    } catch (error) {
      console.error('Copy operation failed:', error);
      // On error, go back to confirmation step
      setCurrentStep('confirmation');
    }
  }, [handleCopyExecute, setCurrentStep]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'action-selection':
        return <ActionSelectionStep onActionSelect={handleActionSelect} />;
      
      case 'client-selection':
      case 'task-selection':
      case 'confirmation':
      case 'processing':
      case 'success':
        if (selectedAction === 'copy-from-client') {
          return (
            <CopyFromClientSteps
              currentStep={currentStep}
              initialClientId={initialClientId}
              clients={clients}
              isClientsLoading={isClientsLoading}
              copyTargetClientId={copyTargetClientId}
              copySelectedTaskIds={copySelectedTaskIds}
              copyStep={copyStep}
              onClientSelect={handleClientSelect}
              onTaskSelectionChange={setCopySelectedTaskIds}
              onStepChange={setCurrentStep}
              onCopyExecute={handleEnhancedCopyExecute}
              isCopyProcessing={isCopyProcessing}
              getSourceClientName={getSourceClientName}
              getTargetClientName={getTargetClientName}
            />
          );
        } else if (selectedAction === 'template-assignment') {
          return (
            <TemplateAssignmentSteps
              currentStep={currentStep}
              selectedTemplateIds={selectedTemplateIds}
              setSelectedTemplateIds={setSelectedTemplateIds}
              selectedClientIds={selectedClientIds}
              setSelectedClientIds={setSelectedClientIds}
              assignmentConfig={assignmentConfig}
              setAssignmentConfig={setAssignmentConfig}
              onStepChange={setCurrentStep}
              onExecuteAssignment={handleTemplateAssignmentExecute}
              isAssignmentProcessing={isAssignmentProcessing}
            />
          );
        } else if (selectedAction === 'template-builder') {
          return (
            <TemplateBuilderSteps
              currentStep={currentStep}
              initialClientId={initialClientId}
              clients={clients}
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
              onStepChange={setCurrentStep}
              onTemplateCreated={handleTemplateCreated}
            />
          );
        }
        break;

      case 'configuration':
        if (selectedAction === 'template-builder') {
          return (
            <TemplateBuilderSteps
              currentStep={currentStep}
              initialClientId={initialClientId}
              clients={clients}
              selectedTaskIds={selectedTaskIds}
              setSelectedTaskIds={setSelectedTaskIds}
              onStepChange={setCurrentStep}
              onTemplateCreated={handleTemplateCreated}
            />
          );
        }
        return (
          <WizardStep 
            title="Configuration"
            description="Configure your operation settings"
          >
            <div className="text-center py-8 text-muted-foreground">
              Configuration for {selectedAction?.replace('-', ' ')} will be implemented here.
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
      
      <WizardNavigation />
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
