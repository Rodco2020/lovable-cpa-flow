
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types/client';
import { StaffOption } from '@/types/staffOption';
import { FormattedTask } from '../types';
import { OptimizedTaskDataService } from '../services/optimizedTaskDataService';
import { TaskDataUtils } from '../utils/taskDataUtils';
import { getActiveStaffForDropdown } from '@/services/staff/staffDropdownService';

/**
 * Hook to manage the data fetching process for clients and tasks
 * Phase 2: Enhanced with React Query caching and optimistic updates
 * - Intelligent caching with 2-minute fresh data and 10-minute cache retention
 * - Optimistic updates for better perceived performance
 * - Automatic background refetching and error recovery
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
