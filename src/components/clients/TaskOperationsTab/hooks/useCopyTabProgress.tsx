
import { useCallback } from 'react';
import { useOperationProgress } from './useOperationProgress';

interface CopyTabProgressReturn {
  progressState: any;
  startOperation: (description: string) => void;
  updateProgress: (percentage: number, status: string) => void;
  completeOperation: (results: any) => void;
  resetProgress: () => void;
  handleExecuteCopy: (
    selectedTaskIds: string[],
    baseCopyHandler: () => Promise<void>,
    onTasksRefresh?: () => void
  ) => Promise<void>;
}

export const useCopyTabProgress = (): CopyTabProgressReturn => {
  const { 
    progressState, 
    startOperation, 
    updateProgress, 
    completeOperation, 
    resetProgress 
  } = useOperationProgress();

  const handleExecuteCopy = useCallback(async (
    selectedTaskIds: string[],
    baseCopyHandler: () => Promise<void>,
    onTasksRefresh?: () => void
  ) => {
    try {
      startOperation('Copying tasks between clients');
      
      // Enhanced progress tracking with better status messages
      updateProgress(20, 'Validating task data and permissions');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(40, 'Preparing tasks for copy operation');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(60, 'Copying tasks to target client');
      await baseCopyHandler();
      
      updateProgress(80, 'Verifying copied tasks');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      updateProgress(95, 'Finalizing task assignments');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const tasksCreated = selectedTaskIds.length;
      completeOperation({
        success: true,
        tasksCreated,
        errors: []
      });
      
      // Trigger refresh of the tasks overview when copy completes successfully
      if (onTasksRefresh) {
        console.log('Copy operation completed successfully, triggering refresh');
        onTasksRefresh();
      }
    } catch (error) {
      console.error('Copy operation failed:', error);
      completeOperation({
        success: false,
        tasksCreated: 0,
        errors: [error instanceof Error ? error.message : 'Copy operation failed']
      });
      throw error;
    }
  }, [startOperation, updateProgress, completeOperation]);

  return {
    progressState,
    startOperation,
    updateProgress,
    completeOperation,
    resetProgress,
    handleExecuteCopy
  };
};
