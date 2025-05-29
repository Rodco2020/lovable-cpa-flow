
import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { copyClientTasks } from '@/services/taskCopyService';
import { useTaskTypeDetection } from './useTaskTypeDetection';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
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
  validationErrors: string[];
  performanceMetrics: any;
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Performance monitoring
  const { metrics, startTiming, endTiming, logPerformance } = usePerformanceMonitoring();

  // Task type detection for proper service routing
  const { data: taskTypeData, isLoading: isDetectingTaskTypes } = useTaskTypeDetection(
    sourceClientId || '',
    selectedTaskIds
  );

  // Step navigation logic
  const stepOrder: CopyTaskStep[] = [
    'select-source-client',
    'select-target-client', 
    'select-tasks',
    'confirm',
    'processing',
    'success'
  ];

  // Enhanced validation functions
  const validateSourceClient = useCallback((clientId: string): string[] => {
    const errors: string[] = [];
    if (!clientId || clientId.trim() === '') {
      errors.push('Source client is required');
    }
    return errors;
  }, []);

  const validateTargetClient = useCallback((clientId: string, sourceId: string): string[] => {
    const errors: string[] = [];
    if (!clientId || clientId.trim() === '') {
      errors.push('Target client is required');
    }
    if (clientId === sourceId) {
      errors.push('Target client cannot be the same as source client');
    }
    return errors;
  }, []);

  const validateTaskSelection = useCallback((taskIds: string[]): string[] => {
    const errors: string[] = [];
    if (taskIds.length === 0) {
      errors.push('At least one task must be selected');
    }
    return errors;
  }, []);

  const handleSelectSourceClient = useCallback((clientId: string) => {
    startTiming('source-client-selection');
    
    const errors = validateSourceClient(clientId);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSourceClientId(clientId);
      // Auto-advance if we have a default source
      if (step === 'select-source-client' && defaultSourceClientId) {
        setStep('select-target-client');
      }
    }
    
    logPerformance('source-client-selection', endTiming('source-client-selection'));
  }, [step, defaultSourceClientId, validateSourceClient, startTiming, endTiming, logPerformance]);

  const handleSelectTargetClient = useCallback((clientId: string) => {
    startTiming('target-client-selection');
    
    if (!sourceClientId) {
      setValidationErrors(['Source client must be selected first']);
      return;
    }

    const errors = validateTargetClient(clientId, sourceClientId);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setTargetClientId(clientId);
      // Auto-advance to task selection
      if (step === 'select-target-client') {
        setStep('select-tasks');
      }
    }
    
    logPerformance('target-client-selection', endTiming('target-client-selection'));
  }, [sourceClientId, step, validateTargetClient, startTiming, endTiming, logPerformance]);

  const handleBack = useCallback(() => {
    startTiming('navigation-back');
    
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1];
      setStep(previousStep);
      
      // Clear validation errors when going back
      setValidationErrors([]);
      
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
    
    logPerformance('navigation-back', endTiming('navigation-back'));
  }, [step, defaultSourceClientId, stepOrder, startTiming, endTiming, logPerformance]);

  const handleNext = useCallback(() => {
    startTiming('navigation-next');
    
    // Validate current step before proceeding
    let errors: string[] = [];
    
    switch (step) {
      case 'select-source-client':
        errors = validateSourceClient(sourceClientId || '');
        break;
      case 'select-target-client':
        errors = validateTargetClient(targetClientId || '', sourceClientId || '');
        break;
      case 'select-tasks':
        errors = validateTaskSelection(selectedTaskIds);
        break;
    }

    setValidationErrors(errors);
    
    if (errors.length === 0) {
      const currentIndex = stepOrder.indexOf(step);
      if (currentIndex < stepOrder.length - 1) {
        const nextStep = stepOrder[currentIndex + 1];
        setStep(nextStep);
      }
    }
    
    logPerformance('navigation-next', endTiming('navigation-next'));
  }, [step, sourceClientId, targetClientId, selectedTaskIds, validateSourceClient, validateTargetClient, validateTaskSelection, stepOrder, startTiming, endTiming, logPerformance]);

  const handleCopy = useCallback(async () => {
    if (!sourceClientId || !targetClientId || selectedTaskIds.length === 0) {
      const errors = [
        ...(!sourceClientId ? ['Source client is required'] : []),
        ...(!targetClientId ? ['Target client is required'] : []),
        ...(selectedTaskIds.length === 0 ? ['At least one task must be selected'] : [])
      ];
      setValidationErrors(errors);
      console.error('Copy operation validation failed:', errors);
      return;
    }

    try {
      startTiming('copy-operation');
      setStep('processing');
      setIsProcessing(true);
      setIsSuccess(false);
      setValidationErrors([]);

      console.log('Starting enhanced copy operation', {
        sourceClientId,
        targetClientId,
        taskCount: selectedTaskIds.length,
        taskTypes: taskTypeData
      });

      // Use task type detection data for proper service routing
      const recurringTaskIds = taskTypeData?.recurringTaskIds || [];
      const adHocTaskIds = taskTypeData?.adHocTaskIds || [];

      // Call the enhanced task copy service
      const result = await copyClientTasks(recurringTaskIds, adHocTaskIds, targetClientId);

      console.log('Copy operation completed successfully', {
        recurringCopied: result.recurring.length,
        adHocCopied: result.adHoc.length
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      await queryClient.invalidateQueries({ queryKey: ['ad-hoc-tasks'] });

      setIsSuccess(true);
      setStep('success');
      
      // Call onClose callback with delay for user feedback
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
      
      logPerformance('copy-operation', endTiming('copy-operation'));
    } catch (error) {
      console.error('Copy operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setValidationErrors([errorMessage]);
      setStep('select-tasks'); // Return to task selection on error
      logPerformance('copy-operation-error', endTiming('copy-operation'));
    } finally {
      setIsProcessing(false);
    }
  }, [sourceClientId, targetClientId, selectedTaskIds, taskTypeData, queryClient, onClose, startTiming, endTiming, logPerformance]);

  const resetDialog = useCallback(() => {
    startTiming('dialog-reset');
    
    setStep('select-source-client');
    setSourceClientId(defaultSourceClientId || null);
    setTargetClientId(null);
    setSelectedTaskIds([]);
    setIsProcessing(false);
    setIsSuccess(false);
    setValidationErrors([]);
    
    logPerformance('dialog-reset', endTiming('dialog-reset'));
  }, [defaultSourceClientId, startTiming, endTiming, logPerformance]);

  // Enhanced validation for next step progression
  const canGoNext = React.useMemo(() => {
    switch (step) {
      case 'select-source-client':
        return !!sourceClientId && validationErrors.length === 0;
      case 'select-target-client':
        return !!targetClientId && 
               targetClientId !== sourceClientId && 
               validationErrors.length === 0;
      case 'select-tasks':
        return selectedTaskIds.length > 0 && validationErrors.length === 0;
      case 'confirm':
        return !isProcessing && validationErrors.length === 0;
      default:
        return false;
    }
  }, [step, sourceClientId, targetClientId, selectedTaskIds.length, isProcessing, validationErrors.length]);

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
    canGoNext,
    validationErrors,
    performanceMetrics: metrics
  };
};
