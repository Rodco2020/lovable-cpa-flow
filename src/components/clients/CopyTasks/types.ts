
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
