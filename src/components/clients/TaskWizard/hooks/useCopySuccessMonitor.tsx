
import { useEffect } from 'react';
import { WizardStep } from '../types';

/**
 * Custom hook for monitoring copy operation success and handling step transitions
 * 
 * This hook provides centralized step progression logic for copy operations.
 * It monitors the copy success state and automatically transitions from 
 * 'processing' to 'success' step when the operation completes.
 * 
 * Enhanced with reliable state-based progression and improved state synchronization verification.
 */
export const useCopySuccessMonitor = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  setCurrentStep: (step: WizardStep) => void
) => {
  // State-based copy success monitoring with reliable progression
  useEffect(() => {
    console.log('useCopySuccessMonitor: State check with enhanced verification', {
      currentStep,
      isCopySuccess,
      isCopyProcessing,
      timestamp: new Date().toISOString(),
      progressionReady: currentStep === 'processing' && isCopySuccess && !isCopyProcessing
    });
    
    // Primary progression logic - state-based only (no fallback timeout)
    if (currentStep === 'processing' && isCopySuccess && !isCopyProcessing) {
      console.log('useCopySuccessMonitor: ✅ ALL CONDITIONS MET - Progressing to success step');
      console.log('useCopySuccessMonitor: Current step is processing ✓');
      console.log('useCopySuccessMonitor: Copy success is true ✓');
      console.log('useCopySuccessMonitor: Copy processing is false ✓');
      console.log('useCopySuccessMonitor: SUCCESS STATE PROPAGATION CONFIRMED - State synchronized properly');
      
      // Use a small delay to ensure UI state is stable
      const progressionTimer = setTimeout(() => {
        console.log('useCopySuccessMonitor: 🚀 EXECUTING STEP TRANSITION TO SUCCESS');
        setCurrentStep('success');
      }, 100);

      return () => {
        console.log('useCopySuccessMonitor: Cleaning up progression timer');
        clearTimeout(progressionTimer);
      };
    }
    
    // Enhanced detailed logging when conditions are not met
    if (currentStep === 'processing') {
      const reasons = [];
      if (!isCopySuccess) {
        reasons.push('Copy success flag is false');
        console.log('useCopySuccessMonitor: ❌ Waiting for copy success flag to be true');
        console.log('useCopySuccessMonitor: STATE SYNC ISSUE - isCopySuccess should be true after successful copy');
      }
      if (isCopyProcessing) {
        reasons.push('Copy still in progress');
        console.log('useCopySuccessMonitor: ❌ Copy still in progress');
      }
      
      if (reasons.length > 0) {
        console.log('useCopySuccessMonitor: Conditions not met for step progression:', reasons.join(', '));
      }
    } else {
      console.log('useCopySuccessMonitor: Not monitoring - current step is not processing:', currentStep);
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, setCurrentStep]);

  // No fallback timeout mechanism - rely entirely on proper state synchronization
  // This ensures that success is only reported when the state properly flows through all hooks
};
