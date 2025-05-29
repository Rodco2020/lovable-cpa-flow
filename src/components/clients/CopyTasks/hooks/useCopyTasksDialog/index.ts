
import React, { useState, useCallback, useMemo } from 'react';
import { useTaskTypeDetection } from '../useTaskTypeDetection';
import { usePerformanceMonitoring } from '../usePerformanceMonitoring';
import { useValidation } from './validation';
import { useStepNavigation } from './stepNavigation';
import { useClientSelection } from './clientSelection';
import { useCopyOperation } from './copyOperation';
import { CopyTaskStep, UseCopyTasksDialogReturn, UseCopyTasksDialogProps } from './types';

/**
 * Enhanced Copy Tasks Dialog Hook - Refactored for maintainability
 * 
 * This hook manages the complete 6-step workflow for copying tasks between clients:
 * 1. Select Source Client
 * 2. Select Target Client  
 * 3. Select Tasks
 * 4. Confirm Operation
 * 5. Processing
 * 6. Success
 * 
 * Key features:
 * - Manual step progression (no auto-advance)
 * - Comprehensive validation at each step
 * - Performance monitoring throughout the workflow
 * - Error handling and recovery
 * - Task type detection for proper service routing
 */
export const useCopyTasksDialog = (
  defaultSourceClientId?: string, 
  onClose?: () => void
): UseCopyTasksDialogReturn => {
  // Always start with select-source-client step for the 6-step workflow
  const [step, setStep] = useState<CopyTaskStep>('select-source-client');
  const [sourceClientId, setSourceClientId] = useState<string | null>(null);
  const [targetClientId, setTargetClientId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Performance monitoring
  const { metrics, startTiming, endTiming, logPerformance } = usePerformanceMonitoring();

  // Task type detection for proper service routing
  const { data: taskTypeData, isLoading: isDetectingTaskTypes } = useTaskTypeDetection(
    sourceClientId || '',
    selectedTaskIds
  );

  // Validation utilities
  const { validateSourceClient, validateTargetClient, validateTaskSelection } = useValidation();

  // Step navigation logic
  const { handleBack, handleNext } = useStepNavigation(
    step,
    setStep,
    setSourceClientId,
    setTargetClientId,
    setSelectedTaskIds,
    setValidationErrors,
    { startTiming, endTiming, logPerformance }
  );

  // Client selection handlers
  const { handleSelectSourceClient, handleSelectTargetClient } = useClientSelection(
    sourceClientId,
    setSourceClientId,
    setTargetClientId,
    setValidationErrors,
    { startTiming, endTiming, logPerformance }
  );

  // Copy operation logic
  const { handleCopy } = useCopyOperation(
    sourceClientId,
    targetClientId,
    selectedTaskIds,
    taskTypeData,
    setStep,
    setIsProcessing,
    setIsSuccess,
    setValidationErrors,
    { startTiming, endTiming, logPerformance },
    onClose
  );

  // Enhanced next handler with validation
  const handleNextWithValidation = useCallback(() => {
    const validator = (currentStep: CopyTaskStep): string[] => {
      switch (currentStep) {
        case 'select-source-client':
          return validateSourceClient(sourceClientId || '');
        case 'select-target-client':
          return validateTargetClient(targetClientId || '', sourceClientId || '');
        case 'select-tasks':
          return validateTaskSelection(selectedTaskIds);
        default:
          return [];
      }
    };

    handleNext(validator);
  }, [handleNext, validateSourceClient, validateTargetClient, validateTaskSelection, sourceClientId, targetClientId, selectedTaskIds]);

  const resetDialog = useCallback(() => {
    startTiming('dialog-reset');
    
    setStep('select-source-client');
    setSourceClientId(null);
    setTargetClientId(null);
    setSelectedTaskIds([]);
    setIsProcessing(false);
    setIsSuccess(false);
    setValidationErrors([]);
    
    logPerformance('dialog-reset', endTiming('dialog-reset'));
  }, [startTiming, endTiming, logPerformance]);

  // Enhanced validation for next step progression
  const canGoNext = useMemo(() => {
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
    handleNext: handleNextWithValidation,
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
