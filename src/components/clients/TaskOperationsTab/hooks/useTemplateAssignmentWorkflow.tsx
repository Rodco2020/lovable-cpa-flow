
import { useState, useCallback } from 'react';
import { useTemplateAssignment } from './useTemplateAssignment';
import { useOperationProgress } from './useOperationProgress';
import { createOperationResults } from './utils/operationResultsHelper';

export type TemplateAssignmentStep = 'selection' | 'configuration' | 'confirmation' | 'processing' | 'complete';

interface UseTemplateAssignmentWorkflowReturn {
  currentStep: TemplateAssignmentStep;
  setCurrentStep: (step: TemplateAssignmentStep) => void;
  templateAssignmentHook: ReturnType<typeof useTemplateAssignment>;
  progressHook: ReturnType<typeof useOperationProgress>;
  handleNext: () => void;
  handleExecuteAssignment: () => Promise<void>;
  handleReset: () => void;
  canGoNext: () => boolean;
}

export const useTemplateAssignmentWorkflow = (
  onTasksRefresh?: () => void
): UseTemplateAssignmentWorkflowReturn => {
  const [currentStep, setCurrentStep] = useState<TemplateAssignmentStep>('selection');

  const templateAssignmentHook = useTemplateAssignment();
  const progressHook = useOperationProgress();

  const {
    selectedTemplateIds,
    selectedClientIds,
    executeAssignment,
    resetOperation,
    validateSelection
  } = templateAssignmentHook;

  const { 
    progressState, 
    startOperation, 
    updateProgress, 
    completeOperation, 
    resetProgress 
  } = progressHook;

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

  return {
    currentStep,
    setCurrentStep,
    templateAssignmentHook,
    progressHook,
    handleNext,
    handleExecuteAssignment,
    handleReset,
    canGoNext
  };
};
