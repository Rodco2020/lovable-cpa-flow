
import { useCallback } from 'react';

export type CopyTabStep = 'select-source-client' | 'selection' | 'task-selection' | 'confirmation' | 'processing' | 'complete';

export interface CopyStep {
  key: CopyTabStep;
  label: string;
}

export const useCopyTabSteps = () => {
  const copySteps: CopyStep[] = [
    { key: 'select-source-client', label: 'Select Source Client' },
    { key: 'selection', label: 'Select Target Client' },
    { key: 'task-selection', label: 'Select Tasks' },
    { key: 'confirmation', label: 'Confirm Copy' },
    { key: 'processing', label: 'Processing' },
    { key: 'complete', label: 'Complete' }
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

  return {
    copySteps,
    getStepIndex,
    isFirstStep,
    isLastStep
  };
};
