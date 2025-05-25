
import { useEffect } from 'react';
import { WizardStep } from '../../types';
import { 
  evaluateProgressionConditions, 
  analyzeProgressionReasons, 
  logSuccessfulProgression 
} from './utils';

/**
 * Hook for monitoring primary copy success state and handling step transitions
 * 
 * This hook implements the main progression logic based on copy operation state.
 * It monitors isCopySuccess, isCopyProcessing, and copyStep to determine when
 * to transition from 'processing' to 'success' step.
 */
export const useCopyProgressionMonitor = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  copyStep: string,
  setCurrentStep: (step: WizardStep) => void
) => {
  useEffect(() => {
    const conditions = evaluateProgressionConditions(
      currentStep,
      isCopySuccess,
      isCopyProcessing,
      copyStep
    );
    
    // Primary progression logic - state-based progression with immediate transition
    if (conditions.allConditionsMet) {
      logSuccessfulProgression('Copy Success Monitor');
      setCurrentStep('success');
      return;
    }
    
    // Log waiting conditions only when in processing step and not progressing
    if (currentStep === 'processing' && !conditions.allConditionsMet) {
      const reasonsAnalysis = analyzeProgressionReasons(
        currentStep,
        isCopySuccess,
        isCopyProcessing,
        copyStep
      );
      
      if (reasonsAnalysis.reasons.length > 0) {
        console.log('Copy operation waiting for conditions:', reasonsAnalysis.reasons.join(', '));
      }
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, copyStep, setCurrentStep]);
};
