
import { supabase } from '@/lib/supabaseClient';
import { calculateNextDueDate } from './dueDateCalculator';
import { BatchOperation } from './types';

/**
 * Task Instance Generator Service
 * 
 * Handles the creation of task instances from recurring tasks.
 * This service generates schedulable task instances based on recurring task configurations.
 */

/**
 * Create a task instance from a recurring task
 * 
 * @param recurringTask - The recurring task object to generate an instance from
 * @param operation - The original batch operation (optional for context)
 * @returns Promise resolving to the created task instance
 */
export const createTaskInstanceFromRecurring = async (recurringTask: any, operation?: BatchOperation): Promise<any> => {
  console.log(`Creating task instance from recurring task: ${recurringTask.id}`);

  const taskInstanceData: any = {
    template_id: recurringTask.template_id,
    client_id: recurringTask.client_id,
    recurring_task_id: recurringTask.id,
    name: recurringTask.name,
    description: recurringTask.description,
    estimated_hours: recurringTask.estimated_hours,
    required_skills: recurringTask.required_skills, // Already resolved to names
    priority: recurringTask.priority,
    category: recurringTask.category,
    status: 'Unscheduled'
  };

  // Use the due date from the recurring task if available, otherwise calculate
  if (recurringTask.due_date) {
    taskInstanceData.due_date = recurringTask.due_date;
  } else {
    // Calculate due date based on recurrence pattern
    const dueDate = calculateNextDueDate(recurringTask);
    if (dueDate) {
      taskInstanceData.due_date = dueDate.toISOString();
    }
  }

  // Insert task instance
  const { data: taskInstance, error: insertError } = await supabase
    .from('task_instances')
    .insert([taskInstanceData])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create task instance from recurring task: ${insertError.message}`);
  }

  console.log(`Successfully created task instance from recurring task: ${taskInstance.id}`);
  return taskInstance;
};
