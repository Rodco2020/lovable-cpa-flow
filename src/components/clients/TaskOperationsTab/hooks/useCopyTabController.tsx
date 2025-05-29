
import { useCopyTabState } from './useCopyTabState';
import { useCopyTabSteps } from './useCopyTabSteps';

export const useCopyTabController = (
  initialClientId: string,
  onClose?: () => void,
  onTasksRefresh?: () => void
) => {
  const { copySteps } = useCopyTabSteps();
  
  const {
    currentStep,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    availableClients,
    isClientsLoading,
    isProcessing,
    isSuccess,
    getSourceClientName,
    getTargetClientName,
    canGoNext,
    handleSelectSourceClient,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    resetDialog
  } = useCopyTabState(initialClientId, onClose);

  // Enhanced copy execution with proper error handling and success callback
  const onExecuteCopy = async () => {
    console.log('Controller: Executing copy operation');
    try {
      await handleCopy();
      console.log('Controller: Copy completed, triggering refresh');
      
      // Trigger tasks refresh on successful copy
      if (onTasksRefresh) {
        onTasksRefresh();
      }
    } catch (error) {
      console.error('Controller: Copy operation failed:', error);
      // Error is already handled by the dialog hook, just log here
    }
  };

  // Enhanced reset with proper cleanup and refresh
  const onReset = () => {
    console.log('Controller: Resetting copy state');
    resetDialog();
    
    // Trigger refresh on reset to ensure UI is up to date
    if (onTasksRefresh) {
      onTasksRefresh();
    }
  };

  return {
    copySteps,
    currentStep,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    availableClients,
    isClientsLoading,
    isProcessing,
    isSuccess,
    onSelectSourceClient: handleSelectSourceClient,
    onSelectTargetClient: handleSelectTargetClient,
    onBack: handleBack,
    onNext: handleNext,
    onExecuteCopy,
    onReset,
    canGoNext,
    getSourceClientName,
    getTargetClientName
  };
};
