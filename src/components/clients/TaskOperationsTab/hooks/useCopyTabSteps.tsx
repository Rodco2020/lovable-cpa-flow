
import { useCallback } from 'react';

export type CopyTabStep = 'select-source-client' | 'selection' | 'task-selection' | 'confirmation' | 'processing' | 'complete';

export interface CopyStep {
  key: CopyTabStep;
  label: string;
  description?: string;
  validationRequired?: boolean;
}

/**
 * Enhanced Copy Tab Steps Hook - 6-Step Workflow Support
 * 
 * Updated to support the complete 6-step workflow with enhanced validation
 * and step configuration for the Task Operations Tab integration.
 * 
 * Features:
 * - Complete 6-step workflow definition
 * - Step validation requirements
 * - Enhanced step descriptions
 * - Navigation helpers
 * - Validation state tracking
 */
export const useCopyTabSteps = () => {
  const copySteps: CopyStep[] = [
    { 
      key: 'select-source-client', 
      label: 'Source Client',
      description: 'Select the client to copy tasks from',
      validationRequired: true
    },
    { 
      key: 'selection', 
      label: 'Target Client',
      description: 'Select the client to copy tasks to',
      validationRequired: true
    },
    { 
      key: 'task-selection', 
      label: 'Select Tasks',
      description: 'Choose which tasks to copy',
      validationRequired: true
    },
    { 
      key: 'confirmation', 
      label: 'Confirm',
      description: 'Review and confirm the operation',
      validationRequired: false
    },
    { 
      key: 'processing', 
      label: 'Processing',
      description: 'Copying tasks in progress',
      validationRequired: false
    },
    { 
      key: 'complete', 
      label: 'Complete',
      description: 'Operation completed successfully',
      validationRequired: false
    }
  ];

  const getStepIndex = useCallback((step: CopyTabStep): number => {
    return copySteps.findIndex(s => s.key === step);
  }, []);

  const isFirstStep = useCallback((step: CopyTabStep): boolean => {
    return getStepIndex(step) === 0;
  }, [getStepIndex]);

  const isLastStep = useCallback((step: CopyTabStep): boolean => {
    return getStepIndex(step) === copySteps.length - 1;
  }, [getStepIndex]);

  const getNextStep = useCallback((currentStep: CopyTabStep): CopyTabStep | null => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex >= 0 && currentIndex < copySteps.length - 1) {
      return copySteps[currentIndex + 1].key;
    }
    return null;
  }, [getStepIndex]);

  const getPreviousStep = useCallback((currentStep: CopyTabStep): CopyTabStep | null => {
    const currentIndex = getStepIndex(currentStep);
    if (currentIndex > 0) {
      return copySteps[currentIndex - 1].key;
    }
    return null;
  }, [getStepIndex]);

  const requiresValidation = useCallback((step: CopyTabStep): boolean => {
    const stepConfig = copySteps.find(s => s.key === step);
    return stepConfig?.validationRequired || false;
  }, []);

  const getStepDescription = useCallback((step: CopyTabStep): string => {
    const stepConfig = copySteps.find(s => s.key === step);
    return stepConfig?.description || '';
  }, []);

  const getProgressPercentage = useCallback((currentStep: CopyTabStep): number => {
    const currentIndex = getStepIndex(currentStep);
    return Math.round(((currentIndex + 1) / copySteps.length) * 100);
  }, [getStepIndex]);

  return {
    copySteps,
    getStepIndex,
    isFirstStep,
    isLastStep,
    getNextStep,
    getPreviousStep,
    requiresValidation,
    getStepDescription,
    getProgressPercentage
  };
};
