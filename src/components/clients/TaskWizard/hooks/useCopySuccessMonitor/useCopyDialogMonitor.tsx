
import { useEffect } from 'react';
import { WizardStep } from '../../types';

/**
 * Hook for monitoring copy dialog state changes
 * 
 * This hook provides additional monitoring specifically for copy dialog state
 * changes and handles edge cases where the dialog completes but the wizard
 * hasn't transitioned yet.
 */
export const useCopyDialogMonitor = (
  copyStep: string,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  currentStep: WizardStep,
  setCurrentStep: (step: WizardStep) => void
) => {
  useEffect(() => {
    // Handle case where copy dialog completes but wizard hasn't transitioned yet
    if (copyStep === 'success' && currentStep === 'processing' && !isCopyProcessing) {
      console.log('Copy dialog reports success - triggering wizard progression');
      setCurrentStep('success');
    }
  }, [copyStep, isCopySuccess, isCopyProcessing, currentStep, setCurrentStep]);
};
