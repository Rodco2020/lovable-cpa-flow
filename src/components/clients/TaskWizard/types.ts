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

// New types for enhanced copy functionality
export interface ClientPreview {
  id: string;
  name: string;
  taskCount: number;
  lastActivity: Date;
  industry: string;
}

export interface AdvancedTaskFilter {
  category?: string;
  priority?: string;
  skillRequired?: string;
  estimatedHoursRange?: [number, number];
  dateRange?: [Date, Date];
  status?: string;
}

// New types for Phase 5: Bulk Operations
export interface BulkSelectionState {
  selectedClientIds: string[];
  selectedTemplateIds: string[];
  operationType: 'template-assignment' | 'task-copy' | 'batch-update';
}

export interface BulkOperationConfig {
  operationType: 'template-assignment' | 'task-copy' | 'batch-update';
  batchSize: number;
  concurrency: number;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'unique' | 'valid-date' | 'positive-number';
  message: string;
}

export interface BulkOperationResult {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  errors: BulkOperationError[];
  processingTime: number;
  results: any[];
}

export interface BulkOperationError {
  clientId?: string;
  templateId?: string;
  error: string;
  details?: any;
}

export interface ProgressUpdate {
  completed: number;
  total: number;
  currentOperation: string;
  percentage: number;
  estimatedTimeRemaining?: number;
}
