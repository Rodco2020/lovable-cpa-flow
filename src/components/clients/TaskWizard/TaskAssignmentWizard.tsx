
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
import { TemplateAssignmentStep } from './TemplateAssignmentStep';
import { AssignmentConfig } from './AssignmentConfiguration';
import { useCopyTasksDialog } from '../CopyTasks/hooks/useCopyTasksDialog';
import { assignTemplatesToClients } from '@/services/templateAssignmentService';
import { Client } from '@/types/client';
import { TemplateBuilder } from './TemplateBuilder';

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
  
  // Template assignment state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assignmentConfig, setAssignmentConfig] = useState<AssignmentConfig>({
    assignmentType: 'ad-hoc',
    customizePerClient: false
  });
  const [isAssignmentProcessing, setIsAssignmentProcessing] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Template builder state
  const [selectedTasksForTemplate, setSelectedTasksForTemplate] = useState<any[]>([]);

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

  const handleActionSelect = (action: WizardAction) => {
    if (action === 'copy-from-client') {
      setCurrentStep('client-selection');
    } else if (action === 'template-assignment') {
      setCurrentStep('task-selection');
    } else if (action === 'template-builder') {
      setCurrentStep('task-selection');
    } else {
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

  const handleTemplateAssignmentExecute = async () => {
    setIsAssignmentProcessing(true);
    setCurrentStep('processing');

    try {
      for (const templateId of selectedTemplateIds) {
        await assignTemplatesToClients({
          templateId,
          clientIds: selectedClientIds,
          config: assignmentConfig
        });
      }
      
      setAssignmentSuccess(true);
      setCurrentStep('success');
    } catch (error) {
      console.error('Template assignment failed:', error);
    } finally {
      setIsAssignmentProcessing(false);
    }
  };

  const handleTemplateCreated = (templateData: any) => {
    console.log('Template created:', templateData);
    setCurrentStep('success');
  };

  const handleTaskSelectionForTemplate = (tasks: any[]) => {
    setSelectedTasksForTemplate(tasks);
    setCurrentStep('configuration');
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
        } else if (selectedAction === 'template-assignment') {
          return (
            <TemplateAssignmentStep
              onNext={() => setCurrentStep('confirmation')}
              onBack={() => setCurrentStep('action-selection')}
              selectedTemplateIds={selectedTemplateIds}
              setSelectedTemplateIds={setSelectedTemplateIds}
              selectedClientIds={selectedClientIds}
              setSelectedClientIds={setSelectedClientIds}
              assignmentConfig={assignmentConfig}
              setAssignmentConfig={setAssignmentConfig}
            />
          );
        } else if (selectedAction === 'template-builder' && initialClientId) {
          return (
            <WizardStep 
              title="Select Tasks for Template"
              description="Choose tasks to convert into a reusable template"
            >
              <SelectTasksStep 
                clientId={initialClientId}
                targetClientId={initialClientId}
                selectedTaskIds={selectedTaskIds}
                setSelectedTaskIds={setSelectedTaskIds}
                step="select-tasks"
                handleBack={() => setCurrentStep('action-selection')}
                handleNext={() => setCurrentStep('configuration')}
                isTemplateBuilder={true}
              />
            </WizardStep>
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

      case 'configuration':
        if (selectedAction === 'template-builder' && selectedTaskIds.length > 0) {
          const tasksForBuilder = selectedTaskIds.map(taskId => {
            // Mock task data - in real implementation, fetch from service
            return {
              task: {
                id: taskId,
                name: `Task ${taskId}`,
                description: 'Task description',
                estimatedHours: 2,
                category: 'Tax',
                priority: 'Medium'
              },
              client: clients.find((c: Client) => c.id === initialClientId) || clients[0]
            };
          });

          return (
            <TemplateBuilder
              selectedTasks={tasksForBuilder}
              onTemplateCreated={handleTemplateCreated}
              onCancel={() => setCurrentStep('task-selection')}
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
        } else if (selectedAction === 'template-assignment') {
          return (
            <WizardStep 
              title="Confirm Template Assignment"
              description="Review and confirm your template assignments"
            >
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Templates Selected</p>
                      <p className="font-medium">{selectedTemplateIds.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clients Selected</p>
                      <p className="font-medium">{selectedClientIds.length}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('task-selection')}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleTemplateAssignmentExecute}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Execute Assignment
                  </button>
                </div>
              </div>
            </WizardStep>
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
        } else if (selectedAction === 'template-assignment') {
          return <ProcessingStep progress={isAssignmentProcessing ? 50 : 100} />;
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
        } else if (selectedAction === 'template-assignment') {
          return (
            <WizardStep 
              title="Assignment Complete"
              description="Templates have been successfully assigned"
            >
              <div className="text-center py-8 text-green-600">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Successful!</h3>
                  <p className="text-gray-600">
                    {selectedTemplateIds.length} template(s) assigned to {selectedClientIds.length} client(s)
                  </p>
                </div>
              </div>
            </WizardStep>
          );
        } else if (selectedAction === 'template-builder') {
          return (
            <WizardStep 
              title="Template Created"
              description="Your template has been successfully created"
            >
              <div className="text-center py-8 text-green-600">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Template Created Successfully!</h3>
                  <p className="text-gray-600">
                    Template created from {selectedTaskIds.length} selected task(s)
                  </p>
                </div>
              </div>
            </WizardStep>
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
