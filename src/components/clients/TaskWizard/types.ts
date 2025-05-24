
export type WizardAction = 'copy-from-client' | 'template-assignment' | 'bulk-operations' | 'template-builder';

export type WizardStep = 'action-selection' | 'client-selection' | 'task-selection' | 'configuration' | 'confirmation' | 'processing' | 'success';

export interface WizardState {
  currentStep: WizardStep;
  selectedAction: WizardAction | null;
  sourceClientId?: string;
  targetClientId?: string;
  selectedTaskIds: string[];
  isProcessing: boolean;
  isComplete: boolean;
}

export interface WizardContextType extends WizardState {
  setCurrentStep: (step: WizardStep) => void;
  setSelectedAction: (action: WizardAction) => void;
  setSourceClientId: (id: string) => void;
  setTargetClientId: (id: string) => void;
  setSelectedTaskIds: (ids: string[]) => void;
  setIsProcessing: (processing: boolean) => void;
  setIsComplete: (complete: boolean) => void;
  resetWizard: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}
