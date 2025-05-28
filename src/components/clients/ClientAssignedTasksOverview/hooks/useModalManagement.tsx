
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteRecurringTaskAssignment, deleteTaskInstance } from '@/services/clientTask';

/**
 * Hook to manage all modal states and operations for the Client Assigned Tasks Overview
 * Handles edit dialogs, delete dialogs, and task management dialog states
 */
export const useModalManagement = (handleEditComplete: () => void) => {
  // Edit task modal state
  const [editRecurringTaskDialogOpen, setEditRecurringTaskDialogOpen] = useState(false);
  const [editAdHocTaskDialogOpen, setEditAdHocTaskDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Delete task modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    name: string;
    type: 'Ad-hoc' | 'Recurring';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Task Management Dialog state
  const [taskManagementDialogOpen, setTaskManagementDialogOpen] = useState(false);

  // Handle task edit
  const handleEditTask = (taskId: string, taskType: 'Ad-hoc' | 'Recurring') => {
    setSelectedTaskId(taskId);
    
    if (taskType === 'Recurring') {
      setEditRecurringTaskDialogOpen(true);
    } else {
      setEditAdHocTaskDialogOpen(true);
    }
  };

  // Handle task delete initiation
  const handleDeleteTask = (taskId: string, taskType: 'Ad-hoc' | 'Recurring', taskName: string) => {
    setTaskToDelete({
      id: taskId,
      name: taskName,
      type: taskType
    });
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    
    try {
      let success = false;
      
      if (taskToDelete.type === 'Recurring') {
        success = await deleteRecurringTaskAssignment(taskToDelete.id);
      } else {
        success = await deleteTaskInstance(taskToDelete.id);
      }

      if (success) {
        toast.success(`${taskToDelete.type} task deleted successfully`);
        handleEditComplete(); // Refresh the data
      } else {
        toast.error(`Failed to delete ${taskToDelete.type.toLowerCase()} task`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(`An error occurred while deleting the ${taskToDelete.type.toLowerCase()} task`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  // Handle refresh from task management operations
  const handleTasksRefresh = () => {
    console.log('Refreshing tasks after management operation');
    handleEditComplete(); // This triggers a full data refresh
  };

  return {
    // Edit task modal state
    editRecurringTaskDialogOpen,
    setEditRecurringTaskDialogOpen,
    editAdHocTaskDialogOpen,
    setEditAdHocTaskDialogOpen,
    selectedTaskId,

    // Delete task modal state
    deleteDialogOpen,
    setDeleteDialogOpen,
    taskToDelete,
    isDeleting,

    // Task management dialog state
    taskManagementDialogOpen,
    setTaskManagementDialogOpen,

    // Handlers
    handleEditTask,
    handleDeleteTask,
    handleDeleteConfirm,
    handleTasksRefresh
  };
};
