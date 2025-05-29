
import React from 'react';
import { SelectSourceClientStep } from './SelectSourceClientStep';
import { SelectClientStep } from './SelectClientStep';
import { SelectTasksStep } from './SelectTasksStep';
import { ConfirmationStep } from './ConfirmationStep';
import { ProcessingStep } from './ProcessingStep';
import { SuccessStep } from './SuccessStep';
import { VisualStepIndicator } from './components/VisualStepIndicator';
import { UserGuidancePanel } from './components/UserGuidancePanel';
import { CopyTaskStep } from './types';
import { Client } from '@/types/client';

interface CopyDialogStepRendererProps {
  step: CopyTaskStep;
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  availableSourceClients: Client[];
  availableTargetClients: Client[];
  isClientsLoading: boolean;
  copyProgress: number;
  displaySourceClientName: string;
  targetClientName: string;
  selectedAdHocTasksCount: number;
  selectedRecurringTasksCount: number;
  adHocTasksCount: number;
  recurringTasksCount: number;
  isProcessing: boolean;
  handleSelectSourceClient: (id: string) => void;
  handleSelectTargetClient: (id: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => Promise<void>;
  setSelectedTaskIds: (ids: string[]) => void;
}

export const CopyDialogStepRenderer: React.FC<CopyDialogStepRendererProps> = ({
  step,
  sourceClientId,
  targetClientId,
  selectedTaskIds,
  availableSourceClients,
  availableTargetClients,
  isClientsLoading,
  copyProgress,
  displaySourceClientName,
  targetClientName,
  selectedAdHocTasksCount,
  selectedRecurringTasksCount,
  adHocTasksCount,
  recurringTasksCount,
  isProcessing,
  handleSelectSourceClient,
  handleSelectTargetClient,
  handleBack,
  handleNext,
  handleCopy,
  setSelectedTaskIds
}) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Visual Step Indicator */}
      <VisualStepIndicator
        currentStep={step}
        sourceClientName={displaySourceClientName}
        targetClientName={targetClientName}
      />

      {/* User Guidance Panel */}
      <UserGuidancePanel 
        currentStep={step === 'select-target-client' ? 'select-client' : step}
      />

      {/* Step Content */}
      <div className="step-content">
        {(() => {
          switch (step) {
            case 'select-source-client':
              return (
                <SelectSourceClientStep 
                  onSelectSourceClient={handleSelectSourceClient}
                  availableClients={availableSourceClients}
                  sourceClientId={sourceClientId || ''}
                  setSourceClientId={(id) => handleSelectSourceClient(id)}
                  isLoading={isClientsLoading}
                />
              );

            case 'select-target-client':
              return (
                <SelectClientStep 
                  sourceClientId={sourceClientId}
                  onSelectClient={handleSelectTargetClient}
                  availableClients={availableTargetClients}
                  targetClientId={targetClientId || ''}
                  setSelectedClientId={(id) => handleSelectTargetClient(id)}
                  isLoading={isClientsLoading}
                  stepType="target"
                />
              );
              
            case 'select-tasks':
              if (sourceClientId && targetClientId) {
                return (
                  <SelectTasksStep 
                    clientId={sourceClientId}
                    targetClientId={targetClientId}
                    selectedTaskIds={selectedTaskIds}
                    setSelectedTaskIds={setSelectedTaskIds}
                    step={step}
                    handleBack={handleBack}
                    handleNext={handleNext}
                  />
                );
              }
              return null;
              
            case 'confirm':
              if (sourceClientId && targetClientId) {
                return (
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
                );
              }
              return null;
              
            case 'processing':
              return <ProcessingStep progress={copyProgress} />;
              
            case 'success':
              return (
                <SuccessStep 
                  sourceClientName={displaySourceClientName}
                  targetClientName={targetClientName}
                  adHocTasksCount={adHocTasksCount}
                  recurringTasksCount={recurringTasksCount}
                />
              );

            default:
              return null;
          }
        })()}
      </div>
    </div>
  );
};
