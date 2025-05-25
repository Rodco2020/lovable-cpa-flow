
import { WizardStep } from '../../types';
import { ProgressionConditions, ProgressionReasons } from './types';

/**
 * Evaluates all conditions required for step progression
 */
export const evaluateProgressionConditions = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  copyStep: string
): ProgressionConditions => {
  const isProcessingStep = currentStep === 'processing';
  const copySuccessOrStepSuccess = isCopySuccess || copyStep === 'success';
  const notProcessing = !isCopyProcessing;
  const allConditionsMet = isProcessingStep && copySuccessOrStepSuccess && notProcessing;

  return {
    isProcessingStep,
    copySuccessOrStepSuccess,
    notProcessing,
    allConditionsMet
  };
};

/**
 * Analyzes why progression conditions are not met
 */
export const analyzeProgressionReasons = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  copyStep: string
): ProgressionReasons => {
  const reasons: string[] = [];
  
  if (currentStep !== 'processing') {
    return { reasons: [`Current step is not processing: ${currentStep}`], shouldProgress: false };
  }

  if (!isCopySuccess && copyStep !== 'success') {
    reasons.push('Copy success flag is false and copyStep is not success');
  }
  
  if (isCopyProcessing) {
    reasons.push('Copy still in progress');
  }

  return {
    reasons,
    shouldProgress: reasons.length === 0
  };
};

/**
 * Logs detailed progression state for debugging
 */
export const logProgressionState = (
  phase: string,
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  copyStep: string,
  conditions: ProgressionConditions
) => {
  console.log(`🔍 ${phase} - useCopySuccessMonitor: State check with enhanced verification`, {
    currentStep,
    isCopySuccess,
    isCopyProcessing,
    copyStep,
    timestamp: new Date().toISOString(),
    shouldProgressConditions: conditions
  });
};

/**
 * Logs successful step progression
 */
export const logSuccessfulProgression = (phase: string) => {
  console.log(`🔍 ${phase} - useCopySuccessMonitor: ✅ ALL CONDITIONS MET - Progressing to success step`);
  console.log(`🔍 ${phase} - useCopySuccessMonitor: Current step is processing ✓`);
  console.log(`🔍 ${phase} - useCopySuccessMonitor: Copy success detected via flag or copyStep ✓`);
  console.log(`🔍 ${phase} - useCopySuccessMonitor: Copy processing is false ✓`);
  console.log(`🔍 ${phase} - useCopySuccessMonitor: SUCCESS STATE PROPAGATION CONFIRMED - Executing immediate transition`);
  console.log(`🔍 ${phase} - useCopySuccessMonitor: 🚀 EXECUTING IMMEDIATE STEP TRANSITION TO SUCCESS`);
};

/**
 * Logs waiting conditions
 */
export const logWaitingConditions = (
  phase: string,
  reasons: string[],
  isCopySuccess: boolean,
  copyStep: string,
  isCopyProcessing: boolean
) => {
  if (reasons.includes('Copy success flag is false and copyStep is not success')) {
    console.log(`🔍 ${phase} - useCopySuccessMonitor: ❌ Waiting for copy success flag or copyStep to indicate success`);
    console.log(`🔍 ${phase} - useCopySuccessMonitor: Current copy success state:`, { isCopySuccess, copyStep });
  }
  
  if (reasons.includes('Copy still in progress')) {
    console.log(`🔍 ${phase} - useCopySuccessMonitor: ❌ Copy still in progress`);
  }
  
  console.log(`🔍 ${phase} - useCopySuccessMonitor: Conditions not met for step progression:`, reasons.join(', '));
  console.log(`🔍 ${phase} - useCopySuccessMonitor: Will continue monitoring until success state propagates properly`);
};
