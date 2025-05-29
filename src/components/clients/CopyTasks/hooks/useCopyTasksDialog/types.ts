
export interface UseCopyTasksDialogReturn {
  step: CopyTaskStep;
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (taskIds: string[]) => void;
  handleSelectSourceClient: (clientId: string) => void;
  handleSelectTargetClient: (clientId: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => Promise<void>;
  isProcessing: boolean;
  isSuccess: boolean;
  resetDialog: () => void;
  isDetectingTaskTypes: boolean;
  canGoNext: boolean;
  validationErrors: string[];
  performanceMetrics: any;
}

export interface UseCopyTasksDialogProps {
  defaultSourceClientId?: string;
  onClose?: () => void;
}

export type CopyTaskStep = 
  | 'select-source-client'
  | 'select-target-client'
  | 'select-tasks'
  | 'confirm'
  | 'processing'
  | 'success';
