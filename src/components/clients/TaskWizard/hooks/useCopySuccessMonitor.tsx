
import { useEffect } from 'react';
import { WizardStep } from '../types';

/**
 * Custom hook for monitoring copy operation success and handling step transitions
 * 
 * This hook provides centralized step progression logic for copy operations.
 * It monitors the copy success state and automatically transitions from 
 * 'processing' to 'success' step when the operation completes.
 * 
 * PHASE 3: Fixed state synchronization and step progression logic
 */
export const useCopySuccessMonitor = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  copyStep: string,
  setCurrentStep: (step: WizardStep) => void
) => {
  // PHASE 3: Enhanced copy success monitoring with reliable progression
  useEffect(() => {
    console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: State check with enhanced verification', {
      currentStep,
      isCopySuccess,
      isCopyProcessing,
      copyStep,
      timestamp: new Date().toISOString(),
      shouldProgressConditions: {
        isProcessingStep: currentStep === 'processing',
        copySuccessOrStepSuccess: isCopySuccess || copyStep === 'success',
        notProcessing: !isCopyProcessing,
        allConditionsMet: currentStep === 'processing' && (isCopySuccess || copyStep === 'success') && !isCopyProcessing
      }
    });
    
    // PHASE 3: Primary progression logic - state-based progression with immediate transition
    if (
      currentStep === 'processing' &&
      (isCopySuccess || copyStep === 'success') &&
      !isCopyProcessing
    ) {
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: ✅ ALL CONDITIONS MET - Progressing to success step');
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Current step is processing ✓');
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Copy success detected via flag or copyStep ✓');
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Copy processing is false ✓');
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: SUCCESS STATE PROPAGATION CONFIRMED - Executing immediate transition');
      
      // PHASE 3: Immediate transition without delay to ensure reliable progression
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: 🚀 EXECUTING IMMEDIATE STEP TRANSITION TO SUCCESS');
      setCurrentStep('success');
      
      return; // Exit early to prevent other logic
    }
    
    // PHASE 3: Enhanced detailed logging when conditions are not met
    if (currentStep === 'processing') {
      const reasons = [];
      if (!isCopySuccess && copyStep !== 'success') {
        reasons.push('Copy success flag is false and copyStep is not success');
        console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: ❌ Waiting for copy success flag or copyStep to indicate success');
        console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Current copy success state:', { isCopySuccess, copyStep });
      }
      if (isCopyProcessing) {
        reasons.push('Copy still in progress');
        console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: ❌ Copy still in progress');
      }
      
      if (reasons.length > 0) {
        console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Conditions not met for step progression:', reasons.join(', '));
        console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Will continue monitoring until success state propagates properly');
      }
    } else {
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Not monitoring - current step is not processing:', currentStep, 'copyStep:', copyStep);
    }
  }, [isCopySuccess, currentStep, isCopyProcessing, copyStep, setCurrentStep]);

  // PHASE 3: Additional effect to monitor copy dialog state changes specifically
  useEffect(() => {
    console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Copy dialog state change detected', {
      copyStep,
      isCopySuccess,
      isCopyProcessing,
      currentStep,
      timestamp: new Date().toISOString()
    });

    // PHASE 3: Handle case where copy dialog completes but wizard hasn't transitioned yet
    if (copyStep === 'success' && currentStep === 'processing' && !isCopyProcessing) {
      console.log('🔍 PHASE 3 FIX - useCopySuccessMonitor: Copy dialog reports success - triggering wizard progression');
      setCurrentStep('success');
    }
  }, [copyStep, isCopySuccess, isCopyProcessing, currentStep, setCurrentStep]);
};
