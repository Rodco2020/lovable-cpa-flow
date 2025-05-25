
import { Client } from '@/types/client';

/**
 * Type definitions for copy operation hooks
 */
export interface CopyOperationState {
  copyStep: string;
  copyTargetClientId?: string;
  copySelectedTaskIds: string[];
  isCopyProcessing: boolean;
  isCopySuccess: boolean;
  isDetectingTaskTypes: boolean;
}

export interface CopyOperationHandlers {
  setCopySelectedTaskIds: (taskIds: string[]) => void;
  handleCopySelectClient: (clientId: string) => void;
  handleEnhancedCopyExecute: () => Promise<void>;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
}

export interface CopyOperationData {
  clients: Client[];
  isClientsLoading: boolean;
}

export interface CopyOperationHookReturn extends 
  CopyOperationState, 
  CopyOperationHandlers, 
  CopyOperationData {}
