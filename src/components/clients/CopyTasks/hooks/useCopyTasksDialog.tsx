
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { copyClientTasks } from '@/services/taskCopyService';
import { useTaskTypeDetection } from './useTaskTypeDetection';
import { CopyTaskStep } from '../types';

export const useCopyTasksDialog = (clientId: string, onClose: () => void) => {
  // PHASE 1 DIAGNOSTIC: Log hook initialization
  console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Hook initialized', {
    clientId,
    onCloseProvided: !!onClose,
    timestamp: new Date().toISOString()
  });

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

  // PHASE 1 DIAGNOSTIC: Log state changes
  const logStateChange = (changedState: string, newValue: any) => {
    console.log(`🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: ${changedState} changed`, {
      newValue,
      currentState: {
        step,
        targetClientId,
        selectedTaskIdsCount: selectedTaskIds.length,
        selectedTaskIds,
        isProcessing,
        isSuccess
      },
      timestamp: new Date().toISOString()
    });
  };

  const handleSelectClient = (id: string) => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: handleSelectClient called', {
      id,
      previousTargetClientId: targetClientId,
      timestamp: new Date().toISOString()
    });
    setTargetClientId(id);
    setStep('select-tasks');
    logStateChange('step and targetClientId', { id, step: 'select-tasks' });
  };

  const handleBack = () => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: handleBack called', {
      currentStep: step,
      timestamp: new Date().toISOString()
    });

    if (step === 'select-tasks') {
      setStep('select-client');
      logStateChange('step', 'select-client');
    } else if (step === 'confirm') {
      setStep('select-tasks');
      logStateChange('step', 'select-tasks');
    } else if (step === 'success') {
      onClose();
    }
  };

  const handleNext = () => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: handleNext called', {
      currentStep: step,
      timestamp: new Date().toISOString()
    });

    if (step === 'select-tasks') {
      setStep('confirm');
      logStateChange('step', 'confirm');
    }
  };

  const handleCopy = async () => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: handleCopy FUNCTION CALLED', {
      targetClientId,
      selectedTaskIds,
      selectedTaskIdsCount: selectedTaskIds.length,
      taskTypeData,
      isDetectingTaskTypes,
      timestamp: new Date().toISOString()
    });

    if (!targetClientId || selectedTaskIds.length === 0 || !taskTypeData) {
      const errorDetails = {
        targetClientId,
        selectedTaskIdsCount: selectedTaskIds.length,
        taskTypeData,
        missingData: {
          noTargetClient: !targetClientId,
          noSelectedTasks: selectedTaskIds.length === 0,
          noTaskTypeData: !taskTypeData
        }
      };
      
      console.error('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Missing required data for copy operation', errorDetails);
      
      toast({
        title: "Error copying tasks",
        description: "Missing required information for copy operation.",
        variant: "destructive"
      });
      return;
    }

    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Starting copy operation with enhanced validation');
    setIsProcessing(true);
    setIsSuccess(false); // Reset success state at start
    setStep('processing');
    logStateChange('processing state', { isProcessing: true, isSuccess: false, step: 'processing' });

    try {
      const { recurringTaskIds, adHocTaskIds } = taskTypeData;
      
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Task type breakdown', {
        recurringCount: recurringTaskIds.length,
        adHocCount: adHocTaskIds.length,
        totalSelected: selectedTaskIds.length,
        recurringTaskIds,
        adHocTaskIds
      });

      // Validate that we found all selected tasks
      const totalFoundTasks = recurringTaskIds.length + adHocTaskIds.length;
      if (totalFoundTasks !== selectedTaskIds.length) {
        console.warn('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Not all selected tasks were found', {
          selectedCount: selectedTaskIds.length,
          foundCount: totalFoundTasks,
          missingCount: selectedTaskIds.length - totalFoundTasks
        });
      }
      
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: CALLING copyClientTasks service with parameters:', {
        recurringTaskIds,
        adHocTaskIds,
        targetClientId,
        serviceCall: 'copyClientTasks(recurringTaskIds, adHocTaskIds, targetClientId)'
      });

      const result = await copyClientTasks(recurringTaskIds, adHocTaskIds, targetClientId);
      
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: copyClientTasks service COMPLETED successfully', {
        result,
        recurringCopied: result.recurring.length,
        adHocCopied: result.adHoc.length,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate queries to refresh task lists for the target client
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Invalidating queries for target client:', targetClientId);
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
      
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Setting success state after database verification');
      
      // CRITICAL: Set success state BEFORE changing step to ensure proper state propagation
      setIsSuccess(true);
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: SUCCESS STATE SET TO TRUE - Ready for step progression');
      
      setStep('success');
      logStateChange('success completion', { isSuccess: true, step: 'success' });
      
      const totalCopied = result.recurring.length + result.adHoc.length;
      toast({
        title: "Tasks copied successfully",
        description: `${totalCopied} task(s) have been copied and verified in the database. ${result.recurring.length} recurring, ${result.adHoc.length} ad-hoc.`,
      });

      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Copy operation fully completed and verified', {
        isSuccess: true,
        isProcessing: false,
        step: 'success',
        totalCopied,
        recurringTasksCount: result.recurring.length,
        adHocTasksCount: result.adHoc.length,
        message: 'State ready for wizard progression'
      });
    } catch (error) {
      console.error("🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Copy operation failed with error:", error);
      console.error("🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Error details:", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString()
      });
      
      setIsSuccess(false);
      setStep('select-tasks'); // Return to task selection to allow retry
      logStateChange('error state', { isSuccess: false, step: 'select-tasks', error });
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during copy operation";
      
      toast({
        title: "Error copying tasks",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Setting processing to false');
      setIsProcessing(false);
      logStateChange('processing complete', { isProcessing: false });
    }
  };

  const resetDialog = () => {
    console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: resetDialog called');
    setStep('select-client');
    setTargetClientId(null);
    setSelectedTaskIds([]);
    setIsProcessing(false);
    setIsSuccess(false);
    logStateChange('reset', { step: 'select-client', targetClientId: null, selectedTaskIds: [], isProcessing: false, isSuccess: false });
  };

  // PHASE 1 DIAGNOSTIC: Log return values
  const returnValue = {
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

  console.log('🔍 PHASE 1 DIAGNOSTIC - useCopyTasksDialog: Returning hook values', {
    step,
    targetClientId,
    selectedTaskIdsCount: selectedTaskIds.length,
    selectedTaskIds,
    isProcessing,
    isSuccess,
    isDetectingTaskTypes,
    handlersAvailable: {
      handleSelectClient: !!handleSelectClient,
      handleBack: !!handleBack,
      handleNext: !!handleNext,
      handleCopy: !!handleCopy,
      resetDialog: !!resetDialog,
      onClose: !!onClose
    },
    timestamp: new Date().toISOString()
  });

  return returnValue;
};
