
import React from 'react';
import { WizardStep } from '../WizardStep';
import { EnhancedClientBrowser } from '../EnhancedClientBrowser';
import { SelectTasksStep } from '../../CopyTasks/SelectTasksStep';
import { ConfirmationStep } from '../../CopyTasks/ConfirmationStep';
import { ProcessingStep } from '../../CopyTasks/ProcessingStep';
import { SuccessStep } from '../../CopyTasks/SuccessStep';
import { Client } from '@/types/client';
import { WizardStep as WizardStepType } from '../types';
import { CopyTaskStep } from '../../CopyTasks/types';

interface CopyFromClientStepsProps {
  currentStep: WizardStepType;
  initialClientId?: string;
  clients: Client[];
  isClientsLoading: boolean;
  copyTargetClientId: string | null;
  copySelectedTaskIds: string[];
  copyStep: string;
  onClientSelect: (clientId: string) => void;
  onTaskSelectionChange: (ids: string[]) => void;
  onStepChange: (step: WizardStepType) => void;
  onCopyExecute: () => Promise<void>;
  isCopyProcessing: boolean;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
}

export const CopyFromClientSteps: React.FC<CopyFromClientStepsProps> = ({
  currentStep,
  initialClientId,
  clients,
  isClientsLoading,
  copyTargetClientId,
  copySelectedTaskIds,
  copyStep,
  onClientSelect,
  onTaskSelectionChange,
  onStepChange,
  onCopyExecute,
  isCopyProcessing,
  getSourceClientName,
  getTargetClientName
}) => {
  const availableClients = Array.isArray(clients) 
    ? clients.filter((client: Client) => client.id !== initialClientId) 
    : [];

  // Convert string step to CopyTaskStep type
  const getCopyTaskStep = (step: string): CopyTaskStep => {
    switch (step) {
      case 'select-client':
        return 'select-client';
      case 'select-tasks':
        return 'select-tasks';
      case 'confirm':
        return 'confirm';
      case 'processing':
        return 'processing';
      case 'success':
        return 'success';
      default:
        return 'select-tasks'; // fallback
    }
  };

  // Calculate progress based on processing state
  const getProcessingProgress = () => {
    if (isCopyProcessing) {
      return 75; // Show 75% while actively processing
    }
    return 100; // Show 100% when complete but before transition
  };

  switch (currentStep) {
    case 'client-selection':
      return (
        <WizardStep 
          title="Select Target Client"
          description="Choose the client you want to copy tasks to"
        >
          <EnhancedClientBrowser
            clients={availableClients}
            onSelectClient={onClientSelect}
            selectedClientId={copyTargetClientId || undefined}
            isLoading={isClientsLoading}
          />
        </WizardStep>
      );

    case 'task-selection':
      if (initialClientId && copyTargetClientId) {
        return (
          <SelectTasksStep 
            clientId={initialClientId}
            targetClientId={copyTargetClientId}
            selectedTaskIds={copySelectedTaskIds}
            setSelectedTaskIds={onTaskSelectionChange}
            step={getCopyTaskStep(copyStep)}
            handleBack={() => onStepChange('client-selection')}
            handleNext={() => onStepChange('confirmation')}
            isTemplateBuilder={false}
          />
        );
      }
      return null;

    case 'confirmation':
      if (initialClientId && copyTargetClientId) {
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
            step={getCopyTaskStep(copyStep)}
            handleBack={() => onStepChange('task-selection')}
            handleCopy={onCopyExecute}
            isProcessing={isCopyProcessing}
          />
        );
      }
      return null;

    case 'processing':
      return <ProcessingStep progress={getProcessingProgress()} />;

    case 'success':
      return (
        <SuccessStep 
          sourceClientName={getSourceClientName()}
          targetClientName={getTargetClientName()}
          adHocTasksCount={Math.floor(copySelectedTaskIds.length * 0.6)}
          recurringTasksCount={Math.ceil(copySelectedTaskIds.length * 0.4)}
        />
      );

    default:
      return null;
  }
};
