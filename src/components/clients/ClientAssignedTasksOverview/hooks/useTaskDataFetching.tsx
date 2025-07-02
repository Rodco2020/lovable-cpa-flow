
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import { FormattedTask } from '../types';
import { OptimizedTaskDataService } from '../services/optimizedTaskDataService';
import { TaskDataUtils } from '../utils/taskDataUtils';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';

/**
 * Hook to manage the data fetching process for clients and tasks
 * Phase 3: Enhanced with real-time updates via Supabase subscriptions
 * - Phase 1: Optimized queries (2 queries instead of 220+)
 * - Phase 2: React Query caching with optimistic updates
 * - Phase 3: Real-time synchronization for multi-user environments
 * - Intelligent caching with 2-minute fresh data and 10-minute cache retention
 * - Optimistic updates for better perceived performance
 * - Automatic background refetching and error recovery
 * - Live updates for recurring_tasks and task_instances tables
 */
export const useTaskDataFetching = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Phase 2: React Query cached data fetching
  const { 
    data: taskData,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['client-tasks'],
    queryFn: async () => {
      console.log('[Phase 2] Starting React Query cached data fetch...');
      
      const result = await OptimizedTaskDataService.fetchAllClientTasks();
      
      // Sort tasks by due date
      const sortedTasks = TaskDataUtils.sortTasksByDueDate(result.formattedTasks);
      
      // Validate data integrity
      if (!TaskDataUtils.validateTaskData(sortedTasks)) {
        console.warn('Some task data validation issues detected');
      }
      
      // Log performance metrics
      console.log(`[Phase 2] Successfully loaded ${sortedTasks.length} tasks from ${result.clients.length} clients`);
      console.log(`[Phase 2] Found ${result.skills.size} unique skills and ${result.priorities.size} unique priorities`);
      console.log('[Phase 2] Data served from React Query cache');
      
      // Log statistics for debugging
      TaskDataUtils.logTaskStatistics(sortedTasks);
      
      return {
        formattedTasks: sortedTasks,
        clients: result.clients,
        skills: Array.from(result.skills),
        priorities: Array.from(result.priorities)
      };
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch staff options using the optimized dropdown service
  const { data: staffOptions = [], isLoading: isStaffLoading } = useQuery({
    queryKey: ['staff-dropdown-options'],
    queryFn: getActiveStaffForDropdown,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Phase 3: Real-time subscriptions for live updates
  useEffect(() => {
    console.log('[Phase 3] Setting up real-time subscriptions...');
    
    // Subscribe to recurring_tasks changes
    const recurringTasksChannel = supabase
      .channel('recurring-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_tasks'
        },
        async (payload) => {
          console.log('[Phase 3] Recurring task change detected:', payload.eventType, payload);
          
          // For real-time updates, we'll invalidate the cache to ensure data consistency
          // This approach ensures we get complete, properly formatted data including joins
          queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
          
          // Show toast notification for real-time updates
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Task Updated",
              description: "A recurring task was updated by another user",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "Task Created",
              description: "A new recurring task was created",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Task Deleted",
              description: "A recurring task was deleted",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to task_instances (ad-hoc tasks) changes
    const adHocTasksChannel = supabase
      .channel('adhoc-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_instances'
        },
        async (payload) => {
          console.log('[Phase 3] Ad-hoc task change detected:', payload.eventType, payload);
          
          // For real-time updates, we'll invalidate the cache to ensure data consistency
          queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
          
          // Show toast notification for real-time updates
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Task Updated", 
              description: "An ad-hoc task was updated by another user",
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "Task Created",
              description: "A new ad-hoc task was created",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Task Deleted",
              description: "An ad-hoc task was deleted",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to client changes that might affect task display
    const clientsChannel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        async (payload) => {
          console.log('[Phase 3] Client change detected:', payload.eventType, payload);
          
          // Invalidate cache when client data changes as it affects task display
          queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Client Updated",
              description: "Client information was updated",
            });
          }
        }
      )
      .subscribe();

    console.log('[Phase 3] Real-time subscriptions established for recurring_tasks, task_instances, and clients');

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[Phase 3] Cleaning up real-time subscriptions...');
      supabase.removeChannel(recurringTasksChannel);
      supabase.removeChannel(adHocTasksChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, [queryClient, toast]);

  // Phase 2: Optimistic update mutation for task updates
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<FormattedTask> & { id: string }) => {
      // This would be implemented with actual update service calls
      // For now, we'll simulate the update and let the refetch handle real data
      console.log('[Phase 2] Optimistic update for task:', updatedTask.id);
      return updatedTask;
    },
    onMutate: async (updatedTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['client-tasks'] });
      
      // Snapshot previous value
      const previousTaskData = queryClient.getQueryData(['client-tasks']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['client-tasks'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          formattedTasks: oldData.formattedTasks.map((task: FormattedTask) => 
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        };
      });
      
      console.log('[Phase 2] Applied optimistic update for task:', updatedTask.id);
      return { previousTaskData };
    },
    onError: (err, updatedTask, context) => {
      // Rollback on error
      if (context?.previousTaskData) {
        queryClient.setQueryData(['client-tasks'], context.previousTaskData);
        console.log('[Phase 2] Rolled back optimistic update due to error:', err);
      }
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
      console.log('[Phase 2] Invalidated cache after mutation');
    }
  });

  // Enhanced refresh handler with optimistic updates support
  const handleRefresh = () => {
    refetchTasks();
    toast({
      title: "Success",
      description: "Tasks refreshed successfully",
    });
  };

  // Enhanced edit complete handler with mutation support
  const handleEditComplete = () => {
    // Invalidate cache to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['client-tasks'] });
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  // Extract data with fallbacks
  const clients = taskData?.clients || [];
  const formattedTasks = taskData?.formattedTasks || [];
  const availableSkills = taskData?.skills || [];
  const availablePriorities = taskData?.priorities || [];
  const isLoading = isTasksLoading || isStaffLoading;
  const error = tasksError ? (tasksError instanceof Error ? tasksError.message : 'Failed to load client tasks') : null;

  return {
    clients,
    formattedTasks,
    isLoading,
    error,
    availableSkills,
    availablePriorities,
    staffOptions,
    fetchData: refetchTasks,
    handleRefresh,
    handleEditComplete,
    // Phase 2: Expose mutation for optimistic updates
    updateTaskMutation,
    queryClient
  };
};
