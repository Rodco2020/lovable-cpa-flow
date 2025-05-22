import { useState, useEffect } from 'react';
import { EditAdHocTaskDialog } from './EditAdHocTaskDialog';
import { TaskInstance } from '@/types/task';
import { getTaskInstanceById, updateTaskInstance } from '@/services/taskService';
import { toast } from 'sonner';

interface EditAdHocTaskContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  onSaveComplete?: () => void;
}

export function EditAdHocTaskContainer({ 
  open, 
  onOpenChange, 
  taskId,
  onSaveComplete 
}: EditAdHocTaskContainerProps) {
  const [task, setTask] = useState<TaskInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptedLoad, setAttemptedLoad] = useState(false);

  // Fetch task data when dialog opens and taskId is available
  useEffect(() => {
    if (open && taskId) {
      setIsLoading(true);
      setError(null);
      
      const fetchTask = async () => {
        try {
          console.log(`Fetching ad-hoc task with ID: ${taskId}`);
          const taskData = await getTaskInstanceById(taskId);
          
          if (taskData) {
            console.log('Ad-hoc task loaded successfully:', taskData);
            setTask(taskData);
            // Reset error state in case there was a previous error
            setError(null);
          } else {
            console.error(`Task with ID ${taskId} not found`);
            setError(`Task with ID ${taskId} not found`);
            toast.error("Failed to load task data");
          }
        } catch (err) {
          console.error("Error fetching ad-hoc task:", err);
          setError("An error occurred while loading task data");
          toast.error("Failed to load task data");
        } finally {
          setIsLoading(false);
          setAttemptedLoad(true);
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
        if (!open) {
          setTask(null);
          setError(null);
          setAttemptedLoad(false);
        }
      }, 300);
    }
  }, [open]);

  // Handle saving the updated task
  const handleSave = async (updatedTask: Partial<TaskInstance>): Promise<void> => {
    if (!updatedTask.id) {
      throw new Error("Task ID is required for updating");
    }
    
    try {
      console.log("Updating ad-hoc task:", updatedTask);
      await updateTaskInstance(updatedTask.id, updatedTask);
      
      // Display success message
      toast.success("Task updated successfully");
      
      // Call the onSaveComplete callback to trigger refresh in parent components
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (err) {
      console.error("Error updating ad-hoc task:", err);
      
      // Format error message for display
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred while updating the task";
      
      toast.error("Failed to update task");
      throw new Error(errorMessage);
    }
  };

  return (
    <EditAdHocTaskDialog
      open={open}
      onOpenChange={onOpenChange}
      task={task}
      onSave={handleSave}
      isLoading={isLoading}
      loadError={error}
      attemptedLoad={attemptedLoad}
    />
  );
}
