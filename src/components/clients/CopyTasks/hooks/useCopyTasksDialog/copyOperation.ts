
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { copyClientTasks } from '@/services/taskCopyService';
import { CopyTaskStep } from './types';

/**
 * Copy operation logic for the copy tasks dialog
 */
export const useCopyOperation = (
  sourceClientId: string | null,
  targetClientId: string | null,
  selectedTaskIds: string[],
  taskTypeData: any,
  setStep: (step: CopyTaskStep) => void,
  setIsProcessing: (processing: boolean) => void,
  setIsSuccess: (success: boolean) => void,
  setValidationErrors: (errors: string[]) => void,
  performanceLogger: any,
  onClose?: () => void
) => {
  const queryClient = useQueryClient();

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
      performanceLogger.startTiming('copy-operation');
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
      
      performanceLogger.logPerformance('copy-operation', performanceLogger.endTiming('copy-operation'));
    } catch (error) {
      console.error('Copy operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setValidationErrors([errorMessage]);
      setStep('select-tasks'); // Return to task selection on error
      performanceLogger.logPerformance('copy-operation-error', performanceLogger.endTiming('copy-operation'));
    } finally {
      setIsProcessing(false);
    }
  }, [
    sourceClientId, 
    targetClientId, 
    selectedTaskIds, 
    taskTypeData, 
    queryClient, 
    onClose, 
    performanceLogger,
    setStep,
    setIsProcessing,
    setIsSuccess,
    setValidationErrors
  ]);

  return { handleCopy };
};
