
export type CopyTaskStep = 'select-client' | 'select-tasks' | 'confirm' | 'processing' | 'success';

export type TaskFilterOption = 'all' | 'recurring' | 'adhoc';

export interface DialogFooterProps {
  step: CopyTaskStep;
  handleBack: () => void;
  handleNext: () => void;
  disableNext?: boolean;
  handleCopy: () => void;
  isProcessing: boolean;
  isSuccess: boolean;
}

export interface Task {
  id: string;
  name: string;
  clientId: string;
  [key: string]: any;
}

export interface SelectClientStepProps {
  sourceClientId: string;
  onSelectClient: (id: string) => void;
}

export interface ConfirmationStepProps {
  sourceClientId: string;
  targetClientId: string;
  selectedCount: number;
  step: CopyTaskStep;
  handleBack: () => void;
  handleCopy: () => Promise<void>;
  isProcessing: boolean;
}

export interface ProcessingStepProps {
  progress: number;
}

export interface SuccessStepProps {
  sourceClientName: string;
  targetClientName: string;
  adHocTasksCount: number;
  recurringTasksCount: number;
}

export interface TaskSelectionPanelFilterProps {
  activeFilter: TaskFilterOption;
  setActiveFilter: (filter: TaskFilterOption) => void;
  recurringTasksCount: number;
  adHocTasksCount: number;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}
