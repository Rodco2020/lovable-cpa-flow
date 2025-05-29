
import { useCallback } from 'react';
import { useCopyTabState } from './useCopyTabState';
import { useCopyTabProgress } from './useCopyTabProgress';
import { useCopyTabSteps } from './useCopyTabSteps';

interface CopyTabControllerReturn {
  // Step management
  copySteps: any[];
  currentStep: string;
  
  // State management
  initialClientId: string;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (ids: string[]) => void;
  availableClients: any[];
  isClientsLoading: boolean;
  
  // Progress management
  progressState: any;
  isProcessing: boolean;
  isSuccess: boolean;
  
  // Event handlers
  onSelectClient: (clientId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onExecuteCopy: () => Promise<void>;
  onReset: () => void;
  
  // Utility functions
  canGoNext: () => boolean;
  getSourceClientName: () => string;
  getTargetClientName: () => string;
}

export const useCopyTabController = (
  initialClientId: string = '',
  onClose?: () => void,
  onTasksRefresh?: () => void
): CopyTabControllerReturn => {
  const { copySteps } = useCopyTabSteps();
  
  const {
    currentStep,
    availableClients,
    isClientsLoading,
    getSourceClientName,
    getTargetClientName,
    canGoNext,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog
  } = useCopyTabState(initialClientId, onClose);

  const {
    progressState,
    resetProgress,
    handleExecuteCopy
  } = useCopyTabProgress();

  const onExecuteCopy = useCallback(async () => {
    await handleExecuteCopy(selectedTaskIds, handleCopy, onTasksRefresh);
  }, [selectedTaskIds, handleCopy, onTasksRefresh, handleExecuteCopy]);

  const onReset = useCallback(() => {
    resetDialog();
    resetProgress();
  }, [resetDialog, resetProgress]);

  const isProcessing = progressState.isProcessing;
  const isSuccess = progressState.operationResults?.success || false;

  return {
    // Step management
    copySteps,
    currentStep,
    
    // State management
    initialClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    availableClients,
    isClientsLoading,
    
    // Progress management
    progressState,
    isProcessing,
    isSuccess,
    
    // Event handlers
    onSelectClient: handleSelectTargetClient,
    onBack: handleBack,
    onNext: handleNext,
    onExecuteCopy,
    onReset,
    
    // Utility functions
    canGoNext,
    getSourceClientName,
    getTargetClientName
  };
};
