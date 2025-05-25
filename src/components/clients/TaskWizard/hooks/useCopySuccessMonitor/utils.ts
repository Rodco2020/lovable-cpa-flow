
import { WizardStep } from '../../types';
import { ProgressionConditions, ProgressionReasons } from './types';

/**
 * Evaluates the conditions required for wizard step progression
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
  
  return {
    isProcessingStep,
    copySuccessOrStepSuccess,
    notProcessing,
    allConditionsMet: isProcessingStep && copySuccessOrStepSuccess && notProcessing
  };
};

/**
 * Analyzes why progression conditions are not yet met
 */
export const analyzeProgressionReasons = (
  currentStep: WizardStep,
  isCopySuccess: boolean,
  isCopyProcessing: boolean,
  copyStep: string
): ProgressionReasons => {
  const reasons: string[] = [];
  
  if (currentStep !== 'processing') {
    reasons.push(`not in processing step (${currentStep})`);
  }
  
  if (!isCopySuccess && copyStep !== 'success') {
    reasons.push(`copy not complete (success: ${isCopySuccess}, step: ${copyStep})`);
  }
  
  if (isCopyProcessing) {
    reasons.push('still processing');
  }
  
  return {
    reasons,
    shouldProgress: reasons.length === 0
  };
};

/**
 * Logs successful progression with minimal information
 */
export const logSuccessfulProgression = (context: string) => {
  console.log(`${context}: Copy operation completed - progressing to success step`);
};
