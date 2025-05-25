
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook to detect task types for proper routing during copy operations
 */
export const useTaskTypeDetection = (clientId: string, taskIds: string[]) => {
  return useQuery({
    queryKey: ['task-type-detection', clientId, taskIds],
    queryFn: async () => {
      if (taskIds.length === 0) {
        return { recurringTaskIds: [], adHocTaskIds: [] };
      }

      // Check recurring tasks
      const { data: recurringTasks, error: recurringError } = await supabase
        .from('recurring_tasks')
        .select('id')
        .eq('client_id', clientId)
        .in('id', taskIds);

      if (recurringError) {
        console.error('Error fetching recurring tasks:', recurringError);
        throw recurringError;
      }

      // Check ad-hoc tasks (task instances)
      const { data: adHocTasks, error: adHocError } = await supabase
        .from('task_instances')
        .select('id')
        .eq('client_id', clientId)
        .in('id', taskIds);

      if (adHocError) {
        console.error('Error fetching ad-hoc tasks:', adHocError);
        throw adHocError;
      }

      const recurringTaskIds = recurringTasks?.map(task => task.id) || [];
      const adHocTaskIds = adHocTasks?.map(task => task.id) || [];

      console.log('Task type detection results:', {
        recurringTaskIds,
        adHocTaskIds,
        totalRequested: taskIds.length,
        totalFound: recurringTaskIds.length + adHocTaskIds.length
      });

      return { recurringTaskIds, adHocTaskIds };
    },
    enabled: taskIds.length > 0 && !!clientId
  });
};
