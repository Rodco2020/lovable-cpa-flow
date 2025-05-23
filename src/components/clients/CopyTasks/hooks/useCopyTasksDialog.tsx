
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
    }
  };

  const handleNext = () => {
    if (step === 'select-tasks') {
      setStep('confirm');
    }
  };

  const handleCopy = async () => {
    if (!targetClientId || selectedTaskIds.length === 0) return;

    setIsProcessing(true);
    setStep('processing');

    try {
      await copyClientTasks(clientId, targetClientId, selectedTaskIds);
      
      // Invalidate queries to refresh task lists
      queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'recurring-tasks']
      });
      queryClient.invalidateQueries({
        queryKey: ['client', targetClientId, 'adhoc-tasks']
      });
      
      setIsSuccess(true);
      setStep('success');
      
      toast({
        title: "Tasks copied successfully",
        description: `${selectedTaskIds.length} task(s) have been copied to the destination client.`,
      });
    } catch (error) {
      console.error("Error copying tasks:", error);
      toast({
        title: "Error copying tasks",
        description: "There was an error copying the tasks. Please try again.",
        variant: "destructive"
      });
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
    onClose
  };
};
