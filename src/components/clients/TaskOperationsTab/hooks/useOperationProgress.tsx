
import { useState, useCallback } from 'react';
import { OperationResults } from './utils/progressTracker';

export interface OperationProgressState {
  isProcessing: boolean;
  progress: number;
  currentOperation: string;
  estimatedTimeRemaining?: number;
  operationResults?: OperationResults;
}

interface UseOperationProgressReturn {
  progressState: OperationProgressState;
  startOperation: (operationName: string) => void;
  updateProgress: (progress: number, currentOperation?: string, estimatedTime?: number) => void;
  completeOperation: (results: OperationResults) => void;
  resetProgress: () => void;
}

const initialProgressState: OperationProgressState = {
  isProcessing: false,
  progress: 0,
  currentOperation: '',
  estimatedTimeRemaining: undefined,
  operationResults: undefined,
};

export const useOperationProgress = (): UseOperationProgressReturn => {
  const [progressState, setProgressState] = useState<OperationProgressState>(initialProgressState);

  const startOperation = useCallback((operationName: string) => {
    setProgressState({
      isProcessing: true,
      progress: 0,
      currentOperation: operationName,
      estimatedTimeRemaining: undefined,
      operationResults: undefined,
    });
  }, []);

  const updateProgress = useCallback((
    progress: number, 
    currentOperation?: string, 
    estimatedTime?: number
  ) => {
    setProgressState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      currentOperation: currentOperation || prev.currentOperation,
      estimatedTimeRemaining: estimatedTime,
    }));
  }, []);

  const completeOperation = useCallback((results: OperationResults) => {
    setProgressState(prev => ({
      ...prev,
      isProcessing: false,
      progress: 100,
      operationResults: results,
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgressState(initialProgressState);
  }, []);

  return {
    progressState,
    startOperation,
    updateProgress,
    completeOperation,
    resetProgress,
  };
};
