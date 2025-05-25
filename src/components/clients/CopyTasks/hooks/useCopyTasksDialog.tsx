
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

    console.log('useCopyTasksDialog: Starting copy operation with proper task type detection');
    setIsProcessing(true);
    setIsSuccess(false);
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
      
      console.log('useCopyTasksDialog: Calling copyClientTasks service with proper task routing');
      await copyClientTasks(recurringTaskIds, adHocTaskIds, targetClientId);
      
      console.log('useCopyTasksDialog: Copy service completed successfully');
      
      // Invalidate queries to refresh task lists
      queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'recurring-tasks']
      });
      queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'adhoc-tasks']
      });
      
      console.log('useCopyTasksDialog: Setting success state to true');
      setIsSuccess(true);
      
      console.log('useCopyTasksDialog: Setting internal step to success');
      setStep('success');
      
      toast({
        title: "Tasks copied successfully",
        description: `${selectedTaskIds.length} task(s) have been copied to the destination client. ${recurringTaskIds.length} recurring, ${adHocTaskIds.length} ad-hoc.`,
      });

      console.log('useCopyTasksDialog: Copy operation fully completed', {
        isSuccess: true,
        isProcessing: false,
        step: 'success',
        recurringTasksCount: recurringTaskIds.length,
        adHocTasksCount: adHocTaskIds.length
      });
    } catch (error) {
      console.error("useCopyTasksDialog: Error copying tasks:", error);
      setIsSuccess(false);
      toast({
        title: "Error copying tasks",
        description: error instanceof Error ? error.message : "There was an error copying the tasks. Please try again.",
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
    onClose,
    isDetectingTaskTypes
  };
};
