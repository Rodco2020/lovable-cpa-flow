
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { copyClientTasks } from '@/services/taskCopyService';
import { useTaskTypeDetection } from './useTaskTypeDetection';
import { CopyTaskStep } from '../types';

export const useCopyTasksDialog = (clientId: string, onClose: () => void) => {
  const [step, setStep] = useState<CopyTaskStep>('select-client');
  const [targetClientId, setTargetClientId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Use task type detection hook
  const { data: taskTypeData, isLoading: isDetectingTaskTypes } = useTaskTypeDetection(
    clientId, 
    selectedTaskIds
  );

  const handleSelectClient = (id: string) => {
    setTargetClientId(id);
    setStep('select-tasks');
  };

  const handleBack = () => {
    if (step === 'select-tasks') {
      setStep('select-client');
    } else if (step === 'confirm') {
      setStep('select-tasks');
    } else if (step === 'success') {
      onClose();
    }
  };

  const handleNext = () => {
    if (step === 'select-tasks') {
      setStep('confirm');
    }
  };

  const handleCopy = async () => {
    if (!targetClientId || selectedTaskIds.length === 0 || !taskTypeData) {
      console.error('useCopyTasksDialog: Missing required data for copy operation', {
        targetClientId,
        selectedTaskIdsCount: selectedTaskIds.length,
        taskTypeData
      });
      toast({
        title: "Error copying tasks",
        description: "Missing required information for copy operation.",
        variant: "destructive"
      });
      return;
    }

    console.log('useCopyTasksDialog: Starting copy operation with enhanced validation');
    setIsProcessing(true);
    setIsSuccess(false); // Reset success state at start
    setStep('processing');

    try {
      const { recurringTaskIds, adHocTaskIds } = taskTypeData;
      
      console.log('useCopyTasksDialog: Task type breakdown', {
        recurringCount: recurringTaskIds.length,
        adHocCount: adHocTaskIds.length,
        totalSelected: selectedTaskIds.length
      });

      // Validate that we found all selected tasks
      const totalFoundTasks = recurringTaskIds.length + adHocTaskIds.length;
      if (totalFoundTasks !== selectedTaskIds.length) {
        console.warn('useCopyTasksDialog: Not all selected tasks were found', {
          selectedCount: selectedTaskIds.length,
          foundCount: totalFoundTasks,
          missingCount: selectedTaskIds.length - totalFoundTasks
        });
      }
      
      console.log('useCopyTasksDialog: Calling copyClientTasks service with enhanced validation and verification');
      const result = await copyClientTasks(recurringTaskIds, adHocTaskIds, targetClientId);
      
      console.log('useCopyTasksDialog: Copy service completed successfully with verification', {
        recurringCopied: result.recurring.length,
        adHocCopied: result.adHoc.length
      });
      
      // Invalidate queries to refresh task lists for the target client
      console.log('useCopyTasksDialog: Invalidating queries for target client:', targetClientId);
      await queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'recurring-tasks']
      });
      await queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'adhoc-tasks']
      });
      
      // Also invalidate the general client tasks overview
      await queryClient.invalidateQueries({
        queryKey: ['client-assigned-tasks']
      });
      
      console.log('useCopyTasksDialog: Setting success state after database verification');
      
      // CRITICAL: Set success state BEFORE changing step to ensure proper state propagation
      setIsSuccess(true);
      console.log('useCopyTasksDialog: SUCCESS STATE SET TO TRUE - Ready for step progression');
      
      setStep('success');
      
      const totalCopied = result.recurring.length + result.adHoc.length;
      toast({
        title: "Tasks copied successfully",
        description: `${totalCopied} task(s) have been copied and verified in the database. ${result.recurring.length} recurring, ${result.adHoc.length} ad-hoc.`,
      });

      console.log('useCopyTasksDialog: Copy operation fully completed and verified', {
        isSuccess: true,
        isProcessing: false,
        step: 'success',
        totalCopied,
        recurringTasksCount: result.recurring.length,
        adHocTasksCount: result.adHoc.length,
        message: 'State ready for wizard progression'
      });
    } catch (error) {
      console.error("useCopyTasksDialog: Copy operation failed with error:", error);
      setIsSuccess(false);
      setStep('select-tasks'); // Return to task selection to allow retry
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during copy operation";
      
      toast({
        title: "Error copying tasks",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log('useCopyTasksDialog: Setting processing to false');
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

  // Enhanced logging when success state changes
  const logSuccessStateChange = (newSuccess: boolean) => {
    console.log('useCopyTasksDialog: Success state change', {
      from: isSuccess,
      to: newSuccess,
      step,
      isProcessing,
      timestamp: new Date().toISOString()
    });
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
    isSuccess, // This now properly maintains state throughout the copy operation
    resetDialog,
    onClose,
    isDetectingTaskTypes
  };
};
