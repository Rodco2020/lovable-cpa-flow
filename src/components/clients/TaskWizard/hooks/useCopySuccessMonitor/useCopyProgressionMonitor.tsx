
import { useEffect } from 'react';
import { WizardStep } from '../../types';
import { 
  evaluateProgressionConditions, 
  analyzeProgressionReasons, 
  logProgressionState, 
  logSuccessfulProgression, 
  logWaitingConditions 
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
    
    logProgressionState(
      'PHASE 3 FIX',
      currentStep,
      isCopySuccess,
      isCopyProcessing,
      copyStep,
      conditions
    );
    
    // Primary progression logic - state-based progression with immediate transition
    if (conditions.allConditionsMet) {
      logSuccessfulProgression('PHASE 3 FIX');
      
      // Immediate transition without delay to ensure reliable progression
      setCurrentStep('success');
      return; // Exit early to prevent other logic
    }
    
    // Enhanced detailed logging when conditions are not met
    if (currentStep === 'processing') {
      const reasonsAnalysis = analyzeProgressionReasons(
        currentStep,
        isCopySuccess,
        isCopyProcessing,
        copyStep
      );
      
      if (reasonsAnalysis.reasons.length > 0) {
        logWaitingConditions(
          'PHASE 3 FIX',
          reasonsAnalysis.reasons,
          isCopySuccess,
          copyStep,
          isCopyProcessing
        );
      }
    } else {
      console.log(`🔍 PHASE 3 FIX - useCopySuccessMonitor: Not monitoring - current step is not processing:`, currentStep, 'copyStep:', copyStep);
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, copyStep, setCurrentStep]);
};
