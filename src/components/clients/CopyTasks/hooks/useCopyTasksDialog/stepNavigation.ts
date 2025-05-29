
import { useCallback } from 'react';
import { CopyTaskStep } from './types';

/**
 * Step navigation logic for the copy tasks dialog
 */
export const useStepNavigation = (
  step: CopyTaskStep,
  setStep: (step: CopyTaskStep) => void,
  setSourceClientId: (id: string | null) => void,
  setTargetClientId: (id: string | null) => void,
  setSelectedTaskIds: (ids: string[]) => void,
  setValidationErrors: (errors: string[]) => void,
  performanceLogger: any
) => {
  const stepOrder: CopyTaskStep[] = [
    'select-source-client',
    'select-target-client', 
    'select-tasks',
    'confirm',
    'processing',
    'success'
  ];

  const handleBack = useCallback(() => {
    performanceLogger.startTiming('navigation-back');
    
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setStep(previousStep);
      
      // Clear validation errors when going back
      setValidationErrors([]);
      
      // Clear state based on which step we're going back to
      switch (previousStep) {
        case 'select-source-client':
          setSourceClientId(null);
          setTargetClientId(null);
          setSelectedTaskIds([]);
          break;
        case 'select-target-client':
          setTargetClientId(null);
          setSelectedTaskIds([]);
          break;
        case 'select-tasks':
          setSelectedTaskIds([]);
          break;
      }
    }
    
    performanceLogger.logPerformance('navigation-back', performanceLogger.endTiming('navigation-back'));
  }, [step, stepOrder, performanceLogger, setStep, setSourceClientId, setTargetClientId, setSelectedTaskIds, setValidationErrors]);

  const handleNext = useCallback((validator: (step: CopyTaskStep) => string[]) => {
    performanceLogger.startTiming('navigation-next');
    
    const errors = validator(step);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      const currentIndex = stepOrder.indexOf(step);
      if (currentIndex < stepOrder.length - 1) {
        const nextStep = stepOrder[currentIndex + 1];
        setStep(nextStep);
        console.log('Advanced to step:', nextStep);
      }
    }
    
    performanceLogger.logPerformance('navigation-next', performanceLogger.endTiming('navigation-next'));
  }, [step, stepOrder, performanceLogger, setStep, setValidationErrors]);

  return {
    handleBack,
    handleNext,
    stepOrder
  };
};
