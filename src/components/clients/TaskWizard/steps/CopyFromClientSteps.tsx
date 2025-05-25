
import React from 'react';
import { WizardStep } from '../WizardStep';
import { EnhancedClientBrowser } from '../EnhancedClientBrowser';
import { SelectTasksStep } from '../../CopyTasks/SelectTasksStep';
import { ConfirmationStep } from '../../CopyTasks/ConfirmationStep';
import { ProcessingStep } from '../../CopyTasks/ProcessingStep';
import { SuccessStep } from '../../CopyTasks/SuccessStep';
import { Client } from '@/types/client';
import { WizardStep as WizardStepType } from '../types';

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
            step={copyStep}
            handleBack={() => onStepChange('client-selection')}
            handleNext={() => onStepChange('confirmation')}
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
            step={copyStep}
            handleBack={() => onStepChange('task-selection')}
            handleCopy={async () => {
              onStepChange('processing');
              await onCopyExecute();
              onStepChange('success');
            }}
            isProcessing={isCopyProcessing}
          />
        );
      }
      return null;

    case 'processing':
      return <ProcessingStep progress={isCopyProcessing ? 50 : 100} />;

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
