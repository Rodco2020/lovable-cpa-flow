
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [copyError, setCopyError] = useState<string | null>(null);
  
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
      setCopyError(null);
    }
  }, [isOpen]);
  
  // Fetch all clients for the dropdown
  const { 
    data: clients, 
    isLoading: clientsLoading,
    error: clientsError
  } = useQuery({
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
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: 'Failed to load ad-hoc tasks',
          variant: "destructive"
        });
      }
    }
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
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: 'Failed to load recurring tasks',
          variant: "destructive"
        });
      }
    }
  });

  // Filter out the source client from the clients list
  const availableClients = useMemo(() => 
    clients?.filter(client => client.id !== sourceClientId) || []
  , [clients, sourceClientId]);
  
  // Filter tasks based on priority - using useMemo for performance with large lists
  const filteredAdHocTasks = useMemo(() => 
    adHocTasks ? adHocTasks.filter(task => 
      filterPriority === 'all' || task.priority.toLowerCase() === filterPriority.toLowerCase()
    ) : []
  , [adHocTasks, filterPriority]);
  
  const filteredRecurringTasks = useMemo(() => 
    recurringTasks ? recurringTasks.filter(task => 
      filterPriority === 'all' || task.priority.toLowerCase() === filterPriority.toLowerCase()
    ) : []
  , [recurringTasks, filterPriority]);
  
  // Task selection handlers - converted to useCallback for performance
  const toggleAdHocTask = useCallback((taskId: string) => {
    setSelectedAdHocTaskIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  }, []);
  
  const toggleRecurringTask = useCallback((taskId: string) => {
    setSelectedRecurringTaskIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(taskId)) {
        newSelection.delete(taskId);
      } else {
        newSelection.add(taskId);
      }
      return newSelection;
    });
  }, []);
  
  const selectAllAdHocTasks = useCallback(() => {
    if (filteredAdHocTasks && filteredAdHocTasks.length > 0) {
      if (selectedAdHocTaskIds.size === filteredAdHocTasks.length) {
        // If all are selected, deselect all
        setSelectedAdHocTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedAdHocTaskIds(new Set(filteredAdHocTasks.map(task => task.id)));
      }
    }
  }, [filteredAdHocTasks, selectedAdHocTaskIds.size]);
  
  const selectAllRecurringTasks = useCallback(() => {
    if (filteredRecurringTasks && filteredRecurringTasks.length > 0) {
      if (selectedRecurringTaskIds.size === filteredRecurringTasks.length) {
        // If all are selected, deselect all
        setSelectedRecurringTaskIds(new Set());
      } else {
        // Otherwise, select all
        setSelectedRecurringTaskIds(new Set(filteredRecurringTasks.map(task => task.id)));
      }
    }
  }, [filteredRecurringTasks, selectedRecurringTaskIds.size]);

  // Get total selected tasks count
  const totalSelectedTasks = selectedAdHocTaskIds.size + selectedRecurringTaskIds.size;
  
  // Get target client object
  const targetClient = availableClients.find(client => client.id === targetClientId);

  const handleNext = useCallback(() => {
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
  }, [step, targetClientId, totalSelectedTasks]);

  const handleBack = useCallback(() => {
    if (step === 'select-tasks') {
      setStep('select-client');
    } else if (step === 'confirmation') {
      setStep('select-tasks');
    }
  }, [step]);

  // Performance optimization - realistic progress simulation with exponential slowdown
  const simulateProgress = useCallback(() => {
    let progress = 0;
    let speed = 10;
    
    const interval = setInterval(() => {
      progress += Math.random() * speed;
      
      // Exponentially decrease speed as we approach 100%
      if (progress > 70) {
        speed = 2;
      } else if (progress > 85) {
        speed = 0.5;
      } else if (progress > 95) {
        speed = 0.1;
      }
      
      if (progress > 100) {
        progress = 99; // Leave the last 1% for the actual completion
        clearInterval(interval);
      }
      
      setCopyProgress(Math.floor(progress));
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  const handleCopy = useCallback(async () => {
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
    setCopyError(null);
    
    // Simulate progress during the copy operation
    const clearProgressSimulation = simulateProgress();
    
    try {
      // Begin copy operation
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
      // Set error state for UI to display
      setCopyError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      toast({
        title: "Error",
        description: 'Failed to copy tasks. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsCopying(false);
      clearProgressSimulation();
    }
  }, [
    targetClientId, 
    selectedAdHocTaskIds, 
    selectedRecurringTaskIds, 
    simulateProgress, 
    queryClient
  ]);

  const handleFinish = useCallback(() => {
    // Close the dialog and reset state
    onClose();
  }, [onClose]);

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
    clientsError,
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
    handleFinish,
    copyError
  };
};
