
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { copyClientTasks } from '@/services/taskCopyService';
import { CopyTaskStep } from '../types';

interface UseCopyTasksDialogReturn {
  step: CopyTaskStep;
  sourceClientId: string | null;
  targetClientId: string | null;
  selectedTaskIds: string[];
  setSelectedTaskIds: (taskIds: string[]) => void;
  handleSelectSourceClient: (clientId: string) => void;
  handleSelectTargetClient: (clientId: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleCopy: () => Promise<void>;
  isProcessing: boolean;
  isSuccess: boolean;
  resetDialog: () => void;
  isDetectingTaskTypes: boolean;
  canGoNext: boolean;
}

export const useCopyTasksDialog = (
  defaultSourceClientId?: string, 
  onClose?: () => void
): UseCopyTasksDialogReturn => {
  const [step, setStep] = useState<CopyTaskStep>('select-source-client');
  const [sourceClientId, setSourceClientId] = useState<string | null>(defaultSourceClientId || null);
  const [targetClientId, setTargetClientId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDetectingTaskTypes, setIsDetectingTaskTypes] = useState(false);
  const queryClient = useQueryClient();

  // Step navigation logic for 6-step workflow
  const stepOrder: CopyTaskStep[] = [
    'select-source-client',
    'select-target-client', 
    'select-tasks',
    'confirm',
    'processing',
    'success'
  ];

  const handleSelectSourceClient = (clientId: string) => {
    setSourceClientId(clientId);
    // Auto-advance to target client selection
    if (step === 'select-source-client') {
      setStep('select-target-client');
    }
  };

  const handleSelectTargetClient = (clientId: string) => {
    setTargetClientId(clientId);
    // Auto-advance to task selection
    if (step === 'select-target-client') {
      setStep('select-tasks');
    }
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setStep(previousStep);
      
      // Clear state based on which step we're going back to
      switch (previousStep) {
        case 'select-source-client':
          setSourceClientId(defaultSourceClientId || null);
          setTargetClientId(null);
          setSelectedTaskIds([]);
          break;
        case 'select-target-client':
          setTargetClientId(null);
          setSelectedTaskIds([]);
          break;
        case 'select-tasks':
          setSelectedTaskIds([]);
          break;
      }
    }
  };

  const handleNext = () => {
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setStep(nextStep);
    }
  };

  const handleCopy = async () => {
    if (!sourceClientId || !targetClientId || selectedTaskIds.length === 0) {
      console.error('Copy failed: Missing source client, target client, or selected tasks');
      return;
    }

    try {
      setStep('processing');
      setIsProcessing(true);
      setIsSuccess(false);

      console.log('Starting copy operation', {
        sourceClientId,
        targetClientId,
        taskCount: selectedTaskIds.length
      });

      // For now, assume all selected tasks are recurring tasks
      // In a real implementation, you would need to separate recurring and ad-hoc tasks
      await copyClientTasks(selectedTaskIds, [], targetClientId);

      console.log('Copy operation completed successfully');
      setIsSuccess(true);
      setStep('success');
      
      // Call onClose callback if provided
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000); // Auto-close after 2 seconds on success
      }
    } catch (error) {
      console.error('Copy operation failed:', error);
      setStep('select-tasks'); // Return to task selection on error
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDialog = () => {
    setStep('select-source-client');
    setSourceClientId(defaultSourceClientId || null);
    setTargetClientId(null);
    setSelectedTaskIds([]);
    setIsProcessing(false);
    setIsSuccess(false);
    setIsDetectingTaskTypes(false);
  };

  // Determine if we can go to the next step
  const canGoNext = React.useMemo(() => {
    switch (step) {
      case 'select-source-client':
        return !!sourceClientId;
      case 'select-target-client':
        return !!targetClientId && targetClientId !== sourceClientId;
      case 'select-tasks':
        return selectedTaskIds.length > 0;
      case 'confirm':
        return !isProcessing;
      default:
        return false;
    }
  }, [step, sourceClientId, targetClientId, selectedTaskIds.length, isProcessing]);

  return {
    step,
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    setSelectedTaskIds,
    handleSelectSourceClient,
    handleSelectTargetClient,
    handleBack,
    handleNext,
    handleCopy,
    isProcessing,
    isSuccess,
    resetDialog,
    isDetectingTaskTypes,
    canGoNext
  };
};
