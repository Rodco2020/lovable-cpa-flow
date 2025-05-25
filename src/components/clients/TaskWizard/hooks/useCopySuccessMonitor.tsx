
import { useEffect } from 'react';
import { WizardStep } from '../types';

/**
 * Custom hook for monitoring copy operation success and handling step transitions
 * 
 * This hook provides centralized step progression logic for copy operations.
 * It monitors the copy success state and automatically transitions from 
 * 'processing' to 'success' step when the operation completes.
 * 
 * The hook uses a reliable state-based approach rather than timers to ensure
 * consistent step transitions regardless of processing time.
 */
export const useCopySuccessMonitor = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  setCurrentStep: (step: WizardStep) => void
) => {
  // Enhanced copy success monitoring with detailed logging and reliable progression
  useEffect(() => {
    console.log('useCopySuccessMonitor: State check', {
      currentStep,
      isCopySuccess,
      isCopyProcessing,
      timestamp: new Date().toISOString()
    });
    
    // Centralized step progression logic
    if (currentStep === 'processing' && isCopySuccess && !isCopyProcessing) {
      console.log('useCopySuccessMonitor: All conditions met for progression to success step');
      console.log('useCopySuccessMonitor: Transitioning from processing to success');
      
      // Use a small delay to ensure UI state is stable
      const progressionTimer = setTimeout(() => {
        console.log('useCopySuccessMonitor: Executing step transition to success');
        setCurrentStep('success');
      }, 100);

      return () => {
        console.log('useCopySuccessMonitor: Cleaning up progression timer');
        clearTimeout(progressionTimer);
      };
    }
    
    // Log when conditions are not met for debugging
    if (currentStep === 'processing') {
      if (!isCopySuccess) {
        console.log('useCopySuccessMonitor: Waiting for copy success flag');
      }
      if (isCopyProcessing) {
        console.log('useCopySuccessMonitor: Copy still in progress');
      }
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, setCurrentStep]);
};
