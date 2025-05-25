
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { copyClientTasks } from '@/services/taskCopyService';
import { CopyTaskStep } from '../types';

interface UseCopyTasksDialogReturn {
  step: CopyTaskStep;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (taskIds: string[]) => void;
  handleSelectClient: (clientId: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => Promise<void>;
  isProcessing: boolean;
  isSuccess: boolean;
  resetDialog: () => void;
  isDetectingTaskTypes: boolean;
}

export const useCopyTasksDialog = (clientId: string, onClose: () => void): UseCopyTasksDialogReturn => {
  const [step, setStep] = useState<CopyTaskStep>('select-client');
  const [targetClientId, setTargetClientId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDetectingTaskTypes, setIsDetectingTaskTypes] = useState(false);
  const queryClient = useQueryClient();

  const handleSelectClient = (clientId: string) => {
    setTargetClientId(clientId);
    setStep('select-tasks');
  };

  const handleBack = () => {
    if (step === 'select-tasks') {
      setStep('select-client');
      setTargetClientId(null);
    } else if (step === 'confirm') {
      setStep('select-tasks');
    }
  };

  const handleNext = () => {
    if (targetClientId) {
      setStep('confirm');
    }
  };

  const handleCopy = async () => {
    if (!targetClientId || selectedTaskIds.length === 0) {
      console.error('Copy failed: Missing target client or selected tasks');
      return;
    }

    try {
      setStep('processing');
      setIsProcessing(true);
      setIsSuccess(false);

      console.log('Starting copy operation', {
        sourceClientId: clientId,
        targetClientId,
        taskCount: selectedTaskIds.length
      });

      // For now, assume all selected tasks are recurring tasks
      // In a real implementation, you would need to separate recurring and ad-hoc tasks
      await copyClientTasks(selectedTaskIds, [], targetClientId);

      console.log('Copy operation completed successfully');
      setIsSuccess(true);
      setStep('success');
    } catch (error) {
      console.error('Copy operation failed:', error);
      setStep('select-tasks'); // Return to task selection on error
      // Let the error bubble up for handling by the caller
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDialog = () => {
    setStep('select-client');
    setTargetClientId(null);
    setSelectedTaskIds([]);
    setIsProcessing(false);
    setIsSuccess(false);
  };

  return {
    step,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectClient,
    handleBack,
    handleNext,
    handleCopy,
    isProcessing,
    isSuccess,
    resetDialog,
    isDetectingTaskTypes
  };
};
