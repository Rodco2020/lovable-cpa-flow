
import { Client } from '@/types/client';

export type CopyTaskStep = 'select-source-client' | 'select-target-client' | 'select-tasks' | 'confirm' | 'processing' | 'success';

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

// Updated SelectClientStepProps to support both source and target selection
export interface SelectClientStepProps {
  sourceClientId?: string;
  targetClientId?: string;
  onSelectClient: (id: string) => void;
  availableClients: any[];
  setSelectedClientId: (id: string) => void;
  isLoading: boolean;
  stepType: 'source' | 'target';
}

// New interface for source client selection
export interface SelectSourceClientStepProps {
  sourceClientId: string | null;
  onSelectClient: (clientId: string) => void;
  availableClients: Client[];
  isLoading: boolean;
  setSourceClientId?: (clientId: string) => void;
}

export interface SelectTargetClientStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  onSelectClient: (clientId: string) => void;
  availableClients: Client[];
  isLoading: boolean;
  sourceClientName: string;
}

export interface EnhancedSelectTasksStepProps {
  sourceClientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (taskIds: string[]) => void;
}

// Updated ConfirmationStepProps to include both source and target
export interface ConfirmationStepProps {
  sourceClientId: string;
  targetClientId: string;
  sourceClientName?: string;
  targetClientName?: string;
  selectedCount: number;
  selectedAdHocTaskCount?: number;
  selectedRecurringTaskCount?: number;
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

export interface TaskSelectionPanelProps {
  tasks: any[];
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  type: 'ad-hoc' | 'recurring';
  onSelectAll: (tasks: any[]) => void;
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}
