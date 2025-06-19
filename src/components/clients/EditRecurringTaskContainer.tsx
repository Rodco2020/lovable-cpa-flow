
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
  const [attemptedLoad, setAttemptedLoad] = useState(false);

  // Fetch task data when dialog opens and taskId is available
  useEffect(() => {
    if (open && taskId) {
      console.log('🔍 [EditRecurringTaskContainer] Fetching task data for ID:', taskId);
      setIsLoading(true);
      setError(null);
      
      const fetchTask = async () => {
        try {
          const taskData = await getRecurringTaskById(taskId);
          
          if (taskData) {
            console.log('✅ [EditRecurringTaskContainer] Task loaded successfully:', {
              taskId: taskData.id,
              preferredStaffId: taskData.preferredStaffId,
              name: taskData.name
            });
            setTask(taskData);
            setError(null);
          } else {
            console.error(`❌ [EditRecurringTaskContainer] Task with ID ${taskId} not found`);
            setError(`Task with ID ${taskId} not found`);
            toast.error("Failed to load task data");
          }
        } catch (err) {
          console.error("❌ [EditRecurringTaskContainer] Error fetching task:", err);
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
  const handleSave = async (updatedTask: Partial<RecurringTask>): Promise<void> => {
    if (!updatedTask.id) {
      throw new Error("Task ID is required for updating");
    }
    
    console.log('💾 [EditRecurringTaskContainer] Starting save operation:', {
      taskId: updatedTask.id,
      preferredStaffId: updatedTask.preferredStaffId,
      name: updatedTask.name
    });
    
    try {
      const result = await updateRecurringTask(updatedTask.id, updatedTask);
      
      if (result) {
        console.log('✅ [EditRecurringTaskContainer] Task updated successfully in database:', {
          taskId: result.id,
          preferredStaffId: result.preferredStaffId,
          name: result.name
        });
        
        // Update local task state to reflect changes
        setTask(result);
        
        toast.success("Task updated successfully");
        
        // Call the onSaveComplete callback to trigger refresh in parent components
        if (onSaveComplete) {
          console.log('🔄 [EditRecurringTaskContainer] Calling onSaveComplete callback');
          onSaveComplete();
        }
      } else {
        throw new Error("Update operation returned null result");
      }
    } catch (err) {
      console.error("❌ [EditRecurringTaskContainer] Error updating task:", err);
      
      // Format error message for display
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred while updating the task";
      
      toast.error("Failed to update task");
      throw new Error(errorMessage);
    }
  };

  return (
    <EditRecurringTaskDialog
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
