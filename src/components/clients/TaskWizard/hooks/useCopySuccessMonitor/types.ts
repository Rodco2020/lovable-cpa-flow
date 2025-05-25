
import { WizardStep } from '../../types';

/**
 * Type definitions for copy success monitoring functionality
 */
export interface CopySuccessMonitorParams {
  currentStep: WizardStep;
  isCopySuccess: boolean;
  isCopyProcessing: boolean;
  copyStep: string;
  setCurrentStep: (step: WizardStep) => void;
}

export interface ProgressionConditions {
  isProcessingStep: boolean;
  copySuccessOrStepSuccess: boolean;
  notProcessing: boolean;
  allConditionsMet: boolean;
}

export interface ProgressionReasons {
  reasons: string[];
  shouldProgress: boolean;
}
