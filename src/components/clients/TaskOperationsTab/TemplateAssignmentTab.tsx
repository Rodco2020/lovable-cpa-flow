
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { useTemplateAssignment } from './hooks/useTemplateAssignment';
import { useOperationProgress } from './hooks/useOperationProgress';
import { createOperationResults } from './hooks/utils/operationResultsHelper';
import { StepIndicator } from './components/StepIndicator';
import { SelectionStep } from './components/SelectionStep';
import { ConfigurationStep } from './components/ConfigurationStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { ProcessingStep } from './components/ProcessingStep';
import { CompleteStep } from './components/CompleteStep';

interface TemplateAssignmentTabProps {
  onClose?: () => void;
  onTasksRefresh?: () => void;
}

export const TemplateAssignmentTab: React.FC<TemplateAssignmentTabProps> = ({ 
  onClose, 
  onTasksRefresh 
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
    setAssignmentConfig,
    executeAssignment,
    resetOperation,
    validateSelection
  } = useTemplateAssignment();

  const { 
    progressState, 
    startOperation, 
    updateProgress, 
    completeOperation, 
    resetProgress 
  } = useOperationProgress();

  const [currentStep, setCurrentStep] = React.useState<'selection' | 'configuration' | 'confirmation' | 'processing' | 'complete'>('selection');

  // Define the steps for the template assignment workflow
  const templateSteps = [
    { key: 'selection', label: 'Selection' },
    { key: 'configuration', label: 'Configuration' },
    { key: 'confirmation', label: 'Confirmation' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' }
  ];

  const handleNext = useCallback(() => {
    const validationErrors = validateSelection();
    if (validationErrors.length > 0) {
      return;
    }

    switch (currentStep) {
      case 'selection':
        setCurrentStep('configuration');
        break;
      case 'configuration':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        handleExecuteAssignment();
        break;
    }
  }, [currentStep, validateSelection]);

  const handleExecuteAssignment = useCallback(async () => {
    try {
      setCurrentStep('processing');
      startOperation('Assigning templates to clients');
      
      // Simulate progress updates during the assignment process
      updateProgress(25, 'Validating template assignments');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing delay
      
      updateProgress(50, 'Creating task instances');
      const success = await executeAssignment();
      
      updateProgress(75, 'Finalizing assignments');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing delay
      
      if (success) {
        const tasksCreated = selectedTemplateIds.length * selectedClientIds.length;
        const operationResults = createOperationResults(true, tasksCreated, []);
        completeOperation(operationResults);
        
        setCurrentStep('complete');
        
        // Trigger refresh of the tasks overview when assignment completes successfully
        if (onTasksRefresh) {
          console.log('Template assignment completed successfully, triggering refresh');
          onTasksRefresh();
        }
      } else {
        const operationResults = createOperationResults(false, 0, ['Assignment operation failed']);
        completeOperation(operationResults);
        // Stay on processing step to show error
      }
    } catch (error) {
      console.error('Assignment execution failed:', error);
      const operationResults = createOperationResults(
        false, 
        0, 
        [error instanceof Error ? error.message : 'Unknown error occurred']
      );
      completeOperation(operationResults);
    }
  }, [
    selectedTemplateIds.length, 
    selectedClientIds.length, 
    startOperation, 
    updateProgress, 
    executeAssignment, 
    completeOperation, 
    onTasksRefresh
  ]);

  const handleReset = useCallback(() => {
    resetOperation();
    resetProgress();
    setCurrentStep('selection');
  }, [resetOperation, resetProgress]);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 'selection':
        return selectedTemplateIds.length > 0 && selectedClientIds.length > 0;
      case 'configuration':
        return true;
      case 'confirmation':
        return !progressState.isProcessing;
      default:
        return false;
    }
  }, [currentStep, selectedTemplateIds.length, selectedClientIds.length, progressState.isProcessing]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Template Assignment</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
