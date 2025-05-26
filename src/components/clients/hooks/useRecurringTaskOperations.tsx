
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getClientRecurringTasks } from '@/services/clientService';
import { deactivateRecurringTask, deleteRecurringTaskAssignment } from '@/services/taskService';

interface UseRecurringTaskOperationsProps {
  clientId: string;
  onRefreshNeeded?: () => void;
}

export const useRecurringTaskOperations = ({ 
  clientId, 
  onRefreshNeeded 
}: UseRecurringTaskOperationsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; name: string } | null>(null);

  const {
    data: tasks = [],
    isLoading: loading,
    error,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ['client', clientId, 'recurring-tasks'],
    queryFn: () => getClientRecurringTasks(clientId),
  });

  const isRefreshing = isFetching && !loading;

  const handleDeactivate = async (taskId: string) => {
    try {
      const success = await deactivateRecurringTask(taskId);
      if (success) {
        toast.success("Task deactivated successfully");
        await refetch();
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        toast.error("Failed to deactivate task");
      }
    } catch (error) {
      console.error("Error deactivating task:", error);
      toast.error("An error occurred while deactivating the task");
    }
  };

  const handleDeleteClick = (taskId: string, taskName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete({ id: taskId, name: taskName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      const success = await deleteRecurringTaskAssignment(taskToDelete.id);
      if (success) {
        toast.success("Task assignment deleted successfully");
        await refetch();
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        toast.error("Failed to delete task assignment");
      }
    } catch (error) {
      console.error("Error deleting task assignment:", error);
      toast.error("An error occurred while deleting the task assignment");
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleRetryLoad = () => {
    refetch();
  };

  return {
    tasks,
    loading,
    error,
    isRefreshing,
    deleteDialogOpen,
    taskToDelete,
    setDeleteDialogOpen,
    handleDeactivate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleRetryLoad,
    refetch
  };
};
