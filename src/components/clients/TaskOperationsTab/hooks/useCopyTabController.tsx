
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

  const onExecuteCopy = async () => {
    try {
      await handleCopy();
      if (onTasksRefresh) {
        onTasksRefresh();
      }
    } catch (error) {
      console.error('Copy operation failed:', error);
    }
  };

  const onReset = () => {
    resetDialog();
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
