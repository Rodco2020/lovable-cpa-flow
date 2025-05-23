
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getActiveClients } from '@/services/clientService';
import { getClientAdHocTasks, getClientRecurringTasks } from '@/services/clientTaskService';
import { copyClientTasks } from '@/services/taskCopyService';
import { Client } from '@/types/client';
import { toast } from '@/components/ui/use-toast';
import { TaskInstance, RecurringTask } from '@/types/task';
import { FilterOption } from '../SelectTasksStep';

export type DialogStep = 'select-client' | 'select-tasks' | 'confirmation' | 'processing' | 'success';
export type TaskTab = 'all' | 'ad-hoc' | 'recurring';

/**
 * Custom hook to manage the state and logic for the CopyClientTasksDialog
 */
export const useCopyTasksDialog = (
  isOpen: boolean,
  onClose: () => void,
  sourceClientId: string,
  sourceClientName: string
) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<DialogStep>('select-client');
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TaskTab>('all');
  const [isCopying, setIsCopying] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [filterPriority, setFilterPriority] = useState<FilterOption>('all');
  
  // Task selection state
  const [selectedAdHocTaskIds, setSelectedAdHocTaskIds] = useState<Set<string>>(new Set());
  const [selectedRecurringTaskIds, setSelectedRecurringTaskIds] = useState<Set<string>>(new Set());
  
  // Result state
  const [copyResults, setCopyResults] = useState<{
    recurring: RecurringTask[];
    adHoc: TaskInstance[];
  } | null>(null);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep('select-client');
      setTargetClientId('');
      setSelectedAdHocTaskIds(new Set());
      setSelectedRecurringTaskIds(new Set());
      setActiveTab('all');
      setFilterPriority('all');
      setCopyProgress(0);
      setCopyResults(null);
    }
  }, [isOpen]);
  
  // Fetch all clients for the dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['active-clients'],
    queryFn: getActiveClients,
    enabled: isOpen,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: 'Failed to load clients',
          variant: "destructive"
        });
      }
    }
  });
  
  // Fetch ad-hoc tasks for the source client
  const { 
    data: adHocTasks, 
    isLoading: adHocLoading,
    error: adHocError
  } = useQuery({
    queryKey: ['client-adhoc-tasks', sourceClientId],
    queryFn: () => getClientAdHocTasks(sourceClientId),
    enabled: isOpen && step === 'select-tasks',
  });
  
  // Fetch recurring tasks for the source client
  const { 
    data: recurringTasks, 
    isLoading: recurringLoading,
    error: recurringError
  } = useQuery({
    queryKey: ['client-recurring-tasks', sourceClientId],
    queryFn: () => getClientRecurringTasks(sourceClientId),
    enabled: isOpen && step === 'select-tasks',
  });

  // Filter out the source client from the clients list
  const availableClients = clients?.filter(client => client.id !== sourceClientId) || [];
  
  // Filter tasks based on priority
  const filteredAdHocTasks = adHocTasks ? adHocTasks.filter(task => 
    filterPriority === 'all' || task.priority.toLowerCase() === filterPriority.toLowerCase()
  ) : [];
  
  const filteredRecurringTasks = recurringTasks ? recurringTasks.filter(task => 
    filterPriority === 'all' || task.priority.toLowerCase() === filterPriority.toLowerCase()
  ) : [];
  
  // Task selection handlers
  const toggleAdHocTask = (taskId: string) => {
    const newSelection = new Set(selectedAdHocTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedAdHocTaskIds(newSelection);
  };
  
  const toggleRecurringTask = (taskId: string) => {
    const newSelection = new Set(selectedRecurringTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedRecurringTaskIds(newSelection);
  };
  
  const selectAllAdHocTasks = () => {
    if (filteredAdHocTasks && filteredAdHocTasks.length > 0) {
      if (selectedAdHocTaskIds.size === filteredAdHocTasks.length) {
        // If all are selected, deselect all
        setSelectedAdHocTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedAdHocTaskIds(new Set(filteredAdHocTasks.map(task => task.id)));
      }
    }
  };
  
  const selectAllRecurringTasks = () => {
    if (filteredRecurringTasks && filteredRecurringTasks.length > 0) {
      if (selectedRecurringTaskIds.size === filteredRecurringTasks.length) {
        // If all are selected, deselect all
        setSelectedRecurringTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedRecurringTaskIds(new Set(filteredRecurringTasks.map(task => task.id)));
      }
    }
  };

  // Get total selected tasks count
  const totalSelectedTasks = selectedAdHocTaskIds.size + selectedRecurringTaskIds.size;
  
  // Get target client object
  const targetClient = availableClients.find(client => client.id === targetClientId);

  const handleNext = () => {
    if (step === 'select-client') {
      if (!targetClientId) {
        toast({
          title: "Error",
          description: 'Please select a target client',
          variant: "destructive"
        });
        return;
      }
      setStep('select-tasks');
    } else if (step === 'select-tasks') {
      if (totalSelectedTasks === 0) {
        toast({
          title: "Error",
          description: 'Please select at least one task to copy',
          variant: "destructive"
        });
        return;
      }
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'select-tasks') {
      setStep('select-client');
    } else if (step === 'confirmation') {
      setStep('select-tasks');
    }
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setCopyProgress(Math.floor(progress));
    }, 200);
    return () => clearInterval(interval);
  };

  const handleCopy = async () => {
    if (!targetClientId || (selectedAdHocTaskIds.size === 0 && selectedRecurringTaskIds.size === 0)) {
      toast({
        title: "Error",
        description: 'Please select a target client and at least one task',
        variant: "destructive"
      });
      return;
    }
    
    setIsCopying(true);
    setStep('processing');
    
    // Simulate progress during the copy operation
    const clearProgressSimulation = simulateProgress();
    
    try {
      const result = await copyClientTasks(
        Array.from(selectedRecurringTaskIds), 
        Array.from(selectedAdHocTaskIds), 
        targetClientId
      );
      
      // Store results for success screen
      setCopyResults(result);
      
      // Set progress to 100% when complete
      setCopyProgress(100);
      
      // Invalidate queries to refresh task lists
      queryClient.invalidateQueries({
        queryKey: ['client-adhoc-tasks', targetClientId]
      });
      
      queryClient.invalidateQueries({
        queryKey: ['client-recurring-tasks', targetClientId]
      });
      
      // Show success screen
      setStep('success');
      toast({
        title: "Success",
        description: `Tasks copied successfully!`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: 'Failed to copy tasks. Please try again.',
        variant: "destructive"
      });
      setStep('confirmation'); // Go back to confirmation step on error
    } finally {
      setIsCopying(false);
      clearProgressSimulation();
    }
  };

  return {
    step,
    targetClientId,
    setTargetClientId,
    activeTab,
    setActiveTab,
    isCopying,
    copyProgress,
    filterPriority,
    setFilterPriority,
    selectedAdHocTaskIds,
    selectedRecurringTaskIds,
    copyResults,
    clients,
    clientsLoading,
    availableClients,
    adHocTasks,
    adHocLoading,
    adHocError,
    recurringTasks,
    recurringLoading,
    recurringError,
    filteredAdHocTasks,
    filteredRecurringTasks,
    targetClient,
    totalSelectedTasks,
    toggleAdHocTask,
    toggleRecurringTask,
    selectAllAdHocTasks,
    selectAllRecurringTasks,
    handleNext,
    handleBack,
    handleCopy,
    handleFinish: onClose
  };
};
