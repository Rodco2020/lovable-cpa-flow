
import { useState, useCallback } from 'react';

export type DialogTab = 'templates' | 'copy' | 'reports' | 'bulk';

interface DialogState {
  activeTab: DialogTab;
  isProcessing: boolean;
  lastOperationSuccess: boolean;
}

interface UseDialogStateReturn {
  state: DialogState;
  setActiveTab: (tab: DialogTab) => void;
  setIsProcessing: (processing: boolean) => void;
  setLastOperationSuccess: (success: boolean) => void;
  resetDialogState: () => void;
}

const initialDialogState: DialogState = {
  activeTab: 'templates',
  isProcessing: false,
  lastOperationSuccess: false,
};

export const useDialogState = (): UseDialogStateReturn => {
  const [state, setState] = useState<DialogState>(initialDialogState);

  const setActiveTab = useCallback((tab: DialogTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  }, []);

  const setIsProcessing = useCallback((processing: boolean) => {
    setState(prev => ({ ...prev, isProcessing: processing }));
  }, []);

  const setLastOperationSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, lastOperationSuccess: success }));
  }, []);

  const resetDialogState = useCallback(() => {
    setState(initialDialogState);
  }, []);

  return {
    state,
    setActiveTab,
    setIsProcessing,
    setLastOperationSuccess,
    resetDialogState,
  };
};
