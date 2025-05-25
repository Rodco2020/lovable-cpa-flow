
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { copyClientTasks } from '@/services/clientService';
import { CopyTaskStep } from '../types';

export const useCopyTasksDialog = (clientId: string, onClose: () => void) => {
  const [step, setStep] = useState<CopyTaskStep>('select-client');
  const [targetClientId, setTargetClientId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    if (!targetClientId || selectedTaskIds.length === 0) return;

    console.log('useCopyTasksDialog: Starting copy operation');
    setIsProcessing(true);
    setIsSuccess(false); // Reset success state
    setStep('processing');

    try {
      // Create separate arrays for recurring and ad-hoc tasks
      const recurringTaskIds: string[] = [];
      const adHocTaskIds: string[] = [];
      
      // For this example, we're just adding all tasks to the ad-hoc array
      selectedTaskIds.forEach(id => {
        adHocTaskIds.push(id);
      });
      
      console.log('useCopyTasksDialog: Calling copyClientTasks service');
      await copyClientTasks(recurringTaskIds, adHocTaskIds, targetClientId);
      
      console.log('useCopyTasksDialog: Copy service completed successfully');
      
      // Invalidate queries to refresh task lists
      queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'recurring-tasks']
      });
      queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'adhoc-tasks']
      });
      
      // Set success state BEFORE changing step when used in wizard context
      console.log('useCopyTasksDialog: Setting success state to true');
      setIsSuccess(true);
      
      // Only change internal step if not used within wizard
      // The wizard will handle its own step progression
      console.log('useCopyTasksDialog: Setting internal step to success');
      setStep('success');
      
      toast({
        title: "Tasks copied successfully",
        description: `${selectedTaskIds.length} task(s) have been copied to the destination client.`,
      });

      console.log('useCopyTasksDialog: Copy operation fully completed', {
        isSuccess: true,
        isProcessing: false,
        step: 'success'
      });
    } catch (error) {
      console.error("useCopyTasksDialog: Error copying tasks:", error);
      setIsSuccess(false);
      toast({
        title: "Error copying tasks",
        description: "There was an error copying the tasks. Please try again.",
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
    onClose
  };
};
