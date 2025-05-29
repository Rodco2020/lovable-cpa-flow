
import React from 'react';
import { Client } from '@/types/client';
import { 
  SourceClientSelectionStep,
  TargetClientSelectionStep,
  TaskSelectionStep,
  ErrorStep
} from '../steps';
import { EnhancedConfirmationStep } from '../EnhancedConfirmationStep';
import { ProcessingStep } from '../ProcessingStep';
import { CompleteStep } from '../CompleteStep';
import { createOperationResults } from '../../hooks/utils/operationResultsHelper';

interface StepRendererProps {
  currentStep: string;
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  availableClients: Client[];
  isClientsLoading: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  canGoNext: boolean;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
  onSelectSourceClient: (clientId: string) => void;
  onSelectTargetClient: (clientId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onExecuteCopy: () => Promise<void>;
  onReset: () => void;
  onClose?: () => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  sourceClientId,
  targetClientId,
  selectedTaskIds,
  setSelectedTaskIds,
  availableClients,
  isClientsLoading,
  isProcessing,
  isSuccess,
  canGoNext,
  getSourceClientName,
  getTargetClientName,
  onSelectSourceClient,
  onSelectTargetClient,
  onBack,
  onNext,
  onExecuteCopy,
  onReset,
  onClose
}) => {
  switch (currentStep) {
    case 'select-source-client':
      return (
        <SourceClientSelectionStep
          sourceClientId={sourceClientId}
          availableClients={availableClients}
          isClientsLoading={isClientsLoading}
          canGoNext={canGoNext}
          isProcessing={isProcessing}
          onSelectSourceClient={onSelectSourceClient}
          onNext={onNext}
          onClose={onClose}
        />
      );

    case 'selection':
      return (
        <TargetClientSelectionStep
          sourceClientId={sourceClientId}
          targetClientId={targetClientId}
          availableClients={availableClients}
          isClientsLoading={isClientsLoading}
          canGoNext={canGoNext}
          isProcessing={isProcessing}
          getSourceClientName={getSourceClientName}
          onSelectTargetClient={onSelectTargetClient}
          onBack={onBack}
          onNext={onNext}
        />
      );

    case 'task-selection':
      return (
        <TaskSelectionStep
          sourceClientId={sourceClientId}
          targetClientId={targetClientId}
          selectedTaskIds={selectedTaskIds}
          canGoNext={canGoNext}
          isProcessing={isProcessing}
          setSelectedTaskIds={setSelectedTaskIds}
          onBack={onBack}
          onNext={onNext}
        />
      );

    case 'confirmation':
      return (
        <EnhancedConfirmationStep
          sourceClientId={sourceClientId || ''}
          targetClientId={targetClientId || ''}
          sourceClientName={getSourceClientName()}
          targetClientName={getTargetClientName()}
          selectedTaskIds={selectedTaskIds}
          onExecute={onExecuteCopy}
          onBack={onBack}
          isProcessing={isProcessing}
        />
      );

    case 'processing':
      return (
        <ProcessingStep
          progress={75}
          isProcessing={isProcessing}
          currentOperation="Copying tasks between clients..."
          sourceClientName={getSourceClientName()}
          targetClientName={getTargetClientName()}
          totalTasks={selectedTaskIds.length}
        />
      );

    case 'complete':
      const operationResults = createOperationResults(
        isSuccess,
        selectedTaskIds.length,
        isSuccess ? [] : ['Copy operation failed']
      );

      return (
        <CompleteStep
          operationResults={operationResults}
          onReset={onReset}
          onClose={onClose}
          error={null}
          sourceClientName={getSourceClientName()}
          targetClientName={getTargetClientName()}
        />
      );

    default:
      return <ErrorStep onReset={onReset} />;
  }
};
