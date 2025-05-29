
import React from 'react';
import { StepIndicator } from './StepIndicator';
import { SelectionStep } from './SelectionStep';
import { ConfigurationStep } from './ConfigurationStep';
import { ConfirmationStep } from './ConfirmationStep';
import { ProcessingStep } from './ProcessingStep';
import { CompleteStep } from './CompleteStep';
import { createOperationResults } from '../hooks/utils/operationResultsHelper';
import { TemplateAssignmentStep } from '../hooks/useTemplateAssignmentWorkflow';
import { useTemplateAssignment } from '../hooks/useTemplateAssignment';
import { useOperationProgress } from '../hooks/useOperationProgress';

interface TemplateAssignmentStepRendererProps {
  currentStep: TemplateAssignmentStep;
  setCurrentStep: (step: TemplateAssignmentStep) => void;
  templateAssignmentHook: ReturnType<typeof useTemplateAssignment>;
  progressHook: ReturnType<typeof useOperationProgress>;
  handleNext: () => void;
  handleExecuteAssignment: () => Promise<void>;
  handleReset: () => void;
  canGoNext: () => boolean;
  onClose?: () => void;
}

export const TemplateAssignmentStepRenderer: React.FC<TemplateAssignmentStepRendererProps> = ({
  currentStep,
  setCurrentStep,
  templateAssignmentHook,
  progressHook,
  handleNext,
  handleExecuteAssignment,
  handleReset,
  canGoNext,
  onClose
}) => {
  const {
    selectedTemplateIds,
    setSelectedTemplateIds,
    availableTemplates,
    isTemplatesLoading,
    selectedClientIds,
    setSelectedClientIds,
    availableClients,
    isClientsLoading,
    assignmentConfig,
    setAssignmentConfig
  } = templateAssignmentHook;

  const { progressState } = progressHook;

  // Define the steps for the template assignment workflow
  const templateSteps = [
    { key: 'selection', label: 'Selection' },
    { key: 'configuration', label: 'Configuration' },
    { key: 'confirmation', label: 'Confirmation' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' }
  ];

  return (
    <div className="space-y-6">
      <StepIndicator 
        currentStep={currentStep} 
        steps={templateSteps}
      />

      {currentStep === 'selection' && (
        <SelectionStep
          selectedTemplateIds={selectedTemplateIds}
          setSelectedTemplateIds={setSelectedTemplateIds}
          availableTemplates={availableTemplates}
          isTemplatesLoading={isTemplatesLoading}
          selectedClientIds={selectedClientIds}
          setSelectedClientIds={setSelectedClientIds}
          availableClients={availableClients}
          isClientsLoading={isClientsLoading}
          onNext={handleNext}
          canGoNext={canGoNext()}
        />
      )}

      {currentStep === 'configuration' && (
        <ConfigurationStep
          assignmentConfig={assignmentConfig}
          setAssignmentConfig={setAssignmentConfig}
          onNext={handleNext}
          onBack={() => setCurrentStep('selection')}
        />
      )}

      {currentStep === 'confirmation' && (
        <ConfirmationStep
          selectedTemplateIds={selectedTemplateIds}
          selectedClientIds={selectedClientIds}
          assignmentConfig={assignmentConfig}
          availableTemplates={availableTemplates}
          availableClients={availableClients}
          onExecute={handleExecuteAssignment}
          onBack={() => setCurrentStep('configuration')}
          isProcessing={progressState.isProcessing}
        />
      )}

      {currentStep === 'processing' && (
        <ProcessingStep
          progress={progressState.progress}
          isProcessing={progressState.isProcessing}
          currentOperation={progressState.currentOperation}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteStep
          operationResults={progressState.operationResults || createOperationResults(false, 0, ['No results available'])}
          onReset={handleReset}
          onClose={onClose}
          error={progressState.operationResults?.success === false ? new Error('Operation failed') : null}
        />
      )}
    </div>
  );
};
