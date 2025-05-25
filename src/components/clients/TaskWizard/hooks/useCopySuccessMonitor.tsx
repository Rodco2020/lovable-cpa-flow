
import { useEffect } from 'react';
import { WizardStep } from '../types';

/**
 * Custom hook for monitoring copy operation success and handling step transitions
 * 
 * This hook provides enhanced monitoring with detailed logging for copy operations
 * and ensures proper step transitions when operations complete successfully.
 */
export const useCopySuccessMonitor = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  setCurrentStep: (step: WizardStep) => void
) => {
  // Enhanced copy success monitoring with detailed logging
  useEffect(() => {
    console.log('TaskAssignmentWizard: State check - currentStep:', currentStep, 'isCopySuccess:', isCopySuccess, 'isCopyProcessing:', isCopyProcessing);
    
    if (isCopySuccess && currentStep === 'processing' && !isCopyProcessing) {
      console.log('TaskAssignmentWizard: Copy operation completed successfully, transitioning to success step');
      setCurrentStep('success');
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, setCurrentStep]);
};
