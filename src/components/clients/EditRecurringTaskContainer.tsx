import { useState, useEffect } from 'react';
import { EditRecurringTaskDialog } from './EditRecurringTaskDialog';
import { RecurringTask } from '@/types/task';
import { getRecurringTaskById, updateRecurringTask } from '@/services/taskService';
import { toast } from 'sonner';

interface EditRecurringTaskContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  onSaveComplete?: () => void;
}

export function EditRecurringTaskContainer({ 
  open, 
  onOpenChange, 
  taskId,
  onSaveComplete 
}: EditRecurringTaskContainerProps) {
  const [task, setTask] = useState<RecurringTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch task data when dialog opens and taskId is available
  useEffect(() => {
    if (open && taskId) {
      setIsLoading(true);
      setError(null);
      
      const fetchTask = async () => {
        try {
          const taskData = await getRecurringTaskById(taskId);
          if (taskData) {
            setTask(taskData);
          } else {
            setError(`Task with ID ${taskId} not found`);
            toast.error("Failed to load task data");
          }
        } catch (err) {
          console.error("Error fetching task:", err);
          setError("An error occurred while loading task data");
          toast.error("Failed to load task data");
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTask();
    }
  }, [open, taskId]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Keep task data briefly to avoid flickering if dialog reopens
      setTimeout(() => {
        if (!open) setTask(null);
      }, 300);
    }
  }, [open]);

  // Handle saving the updated task
  const handleSave = async (updatedTask: Partial<RecurringTask>): Promise<void> => {
    if (!updatedTask.id) {
      throw new Error("Task ID is required for updating");
    }
    
    try {
      await updateRecurringTask(updatedTask.id, updatedTask);
      toast.success("Task updated successfully");
      
      // Call the onSaveComplete callback to trigger refresh in parent components
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  return (
    <EditRecurringTaskDialog
      open={open}
      onOpenChange={onOpenChange}
      task={task}
      onSave={handleSave}
      isLoading={isLoading}
    />
  );
}
