
import { supabase } from '@/lib/supabaseClient';
import { TaskInstance, RecurringTask, TaskStatus } from '@/types/task';
import { getRecurringTaskById, getTaskInstanceById } from './clientTaskService';

/**
 * Task Copy Service
 * 
 * This service provides functionality for copying tasks between clients.
 * It supports copying individual tasks as well as bulk operations.
 * Enhanced with transaction verification and proper error handling.
 */

/**
 * Formats a recurring task from database format to application type
 */
const formatRecurringTaskFromDB = (data: any): RecurringTask => {
  const recurrencePattern = {
    type: data.recurrence_type,
    interval: data.recurrence_interval || undefined,
    weekdays: data.weekdays || undefined,
    dayOfMonth: data.day_of_month || undefined,
    monthOfYear: data.month_of_year || undefined,
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    customOffsetDays: data.custom_offset_days || undefined,
  };
  
  return {
    id: data.id,
    templateId: data.template_id,
    clientId: data.client_id,
    name: data.name,
    description: data.description || '',
    estimatedHours: data.estimated_hours,
    requiredSkills: data.required_skills || [],
    priority: data.priority,
    category: data.category,
    status: data.status,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    recurrencePattern,
    lastGeneratedDate: data.last_generated_date ? new Date(data.last_generated_date) : null,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes
  };
};

/**
 * Formats a task instance from database format to application type
 */
const formatTaskInstanceFromDB = (data: any): TaskInstance => {
  return {
    id: data.id,
    templateId: data.template_id,
    clientId: data.client_id,
    name: data.name,
    description: data.description || '',
    estimatedHours: data.estimated_hours,
    requiredSkills: data.required_skills || [],
    priority: data.priority,
    category: data.category,
    status: data.status,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    notes: data.notes
  };
};

/**
 * Validates that target client exists and is accessible
 */
const validateTargetClient = async (targetClientId: string): Promise<void> => {
  console.log(`taskCopyService: Validating target client ${targetClientId}`);
  
  const { data, error } = await supabase
    .from('clients')
    .select('id, legal_name')
    .eq('id', targetClientId)
    .single();
  
  if (error) {
    console.error('taskCopyService: Target client validation failed:', error);
    throw new Error(`Target client validation failed: ${error.message}`);
  }
  
  if (!data) {
    throw new Error(`Target client with ID ${targetClientId} not found`);
  }
  
  console.log('taskCopyService: Target client validation successful:', data.legal_name);
};

/**
 * Validates that template exists (if templateId is provided)
 */
const validateTemplate = async (templateId: string): Promise<void> => {
  if (!templateId) return;
  
  console.log(`taskCopyService: Validating template ${templateId}`);
  
  const { data, error } = await supabase
    .from('task_templates')
    .select('id, name')
    .eq('id', templateId)
    .single();
  
  if (error) {
    console.error('taskCopyService: Template validation failed:', error);
    throw new Error(`Template validation failed: ${error.message}`);
  }
  
  if (!data) {
    throw new Error(`Template with ID ${templateId} not found`);
  }
  
  console.log('taskCopyService: Template validation successful:', data.name);
};

/**
 * Verifies that a recurring task was actually inserted into the database
 */
const verifyRecurringTaskCopied = async (targetClientId: string, taskName: string): Promise<RecurringTask> => {
  console.log(`taskCopyService: Verifying recurring task "${taskName}" was copied to client ${targetClientId}`);
  
  const { data, error } = await supabase
    .from('recurring_tasks')
    .select('*')
    .eq('client_id', targetClientId)
    .eq('name', taskName)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('taskCopyService: Verification query failed:', error);
    throw new Error(`Failed to verify recurring task copy: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error(`Recurring task "${taskName}" was not found in target client after copy operation`);
  }
  
  console.log('taskCopyService: Recurring task copy verified successfully:', data[0].id);
  return formatRecurringTaskFromDB(data[0]);
};

/**
 * Verifies that a task instance was actually inserted into the database
 */
const verifyTaskInstanceCopied = async (targetClientId: string, taskName: string): Promise<TaskInstance> => {
  console.log(`taskCopyService: Verifying task instance "${taskName}" was copied to client ${targetClientId}`);
  
  const { data, error } = await supabase
    .from('task_instances')
    .select('*')
    .eq('client_id', targetClientId)
    .eq('name', taskName)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('taskCopyService: Verification query failed:', error);
    throw new Error(`Failed to verify task instance copy: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error(`Task instance "${taskName}" was not found in target client after copy operation`);
  }
  
  console.log('taskCopyService: Task instance copy verified successfully:', data[0].id);
  return formatTaskInstanceFromDB(data[0]);
};

/**
 * Prepares a recurring task for database insertion
 */
const prepareRecurringTaskForInsert = (sourceTask: RecurringTask, targetClientId: string) => {
  return {
    template_id: sourceTask.templateId,
    client_id: targetClientId,
    name: sourceTask.name,
    description: sourceTask.description || null,
    estimated_hours: sourceTask.estimatedHours,
    required_skills: sourceTask.requiredSkills,
    priority: sourceTask.priority,
    category: sourceTask.category,
    due_date: sourceTask.dueDate ? sourceTask.dueDate.toISOString() : null,
    recurrence_type: sourceTask.recurrencePattern.type,
    recurrence_interval: sourceTask.recurrencePattern.interval,
    weekdays: sourceTask.recurrencePattern.weekdays,
    day_of_month: sourceTask.recurrencePattern.dayOfMonth,
    month_of_year: sourceTask.recurrencePattern.monthOfYear,
    end_date: sourceTask.recurrencePattern.endDate ? sourceTask.recurrencePattern.endDate.toISOString() : null,
    custom_offset_days: sourceTask.recurrencePattern.customOffsetDays,
    notes: sourceTask.notes,
    is_active: true,
    status: 'Unscheduled' as TaskStatus
  };
};

/**
 * Prepares a task instance for database insertion
 */
const prepareTaskInstanceForInsert = (sourceTask: TaskInstance, targetClientId: string) => {
  return {
    template_id: sourceTask.templateId,
    client_id: targetClientId,
    name: sourceTask.name,
    description: sourceTask.description || null,
    estimated_hours: sourceTask.estimatedHours,
    required_skills: sourceTask.requiredSkills,
    priority: sourceTask.priority,
    category: sourceTask.category,
    due_date: sourceTask.dueDate ? sourceTask.dueDate.toISOString() : null,
    notes: sourceTask.notes,
    status: 'Unscheduled' as TaskStatus
  };
};

/**
 * Copy a recurring task to another client with proper validation and verification
 */
export const copyRecurringTask = async (taskId: string, targetClientId: string): Promise<RecurringTask> => {
  console.log(`taskCopyService: Starting recurring task copy ${taskId} to client ${targetClientId}`);
  
  // Step 1: Validate target client exists
  await validateTargetClient(targetClientId);
  
  // Step 2: Get the source task
  const sourceTask = await getRecurringTaskById(taskId);
  
  if (!sourceTask) {
    const error = `Recurring task with ID ${taskId} not found`;
    console.error('taskCopyService:', error);
    throw new Error(error);
  }
  
  console.log('taskCopyService: Source recurring task found:', sourceTask.name);
  
  // Step 3: Validate template if it exists
  if (sourceTask.templateId) {
    await validateTemplate(sourceTask.templateId);
  }
  
  // Step 4: Prepare task data for insertion
  const newTaskData = prepareRecurringTaskForInsert(sourceTask, targetClientId);
  
  console.log('taskCopyService: Prepared recurring task data for insertion:', {
    name: newTaskData.name,
    client_id: newTaskData.client_id,
    recurrence_type: newTaskData.recurrence_type
  });
  
  // Step 5: Insert the new task (let database errors bubble up)
  console.log('taskCopyService: Attempting database insertion...');
  const { data, error } = await supabase
    .from('recurring_tasks')
    .insert([newTaskData])
    .select()
    .single();
  
  if (error) {
    console.error('taskCopyService: Database insertion failed:', error);
    throw new Error(`Failed to copy recurring task: ${error.message}`);
  }
  
  console.log('taskCopyService: Database insertion completed, verifying...');
  
  // Step 6: Verify the task was actually copied by querying it back
  const verifiedTask = await verifyRecurringTaskCopied(targetClientId, sourceTask.name);
  
  console.log('taskCopyService: Recurring task copy completed and verified:', verifiedTask.id);
  return verifiedTask;
};

/**
 * Copy an ad-hoc task to another client with proper validation and verification
 */
export const copyAdHocTask = async (taskId: string, targetClientId: string): Promise<TaskInstance> => {
  console.log(`taskCopyService: Starting ad-hoc task copy ${taskId} to client ${targetClientId}`);
  
  // Step 1: Validate target client exists
  await validateTargetClient(targetClientId);
  
  // Step 2: Get the source task
  const sourceTask = await getTaskInstanceById(taskId);
  
  if (!sourceTask) {
    const error = `Ad-hoc task with ID ${taskId} not found`;
    console.error('taskCopyService:', error);
    throw new Error(error);
  }
  
  console.log('taskCopyService: Source ad-hoc task found:', sourceTask.name);
  
  // Step 3: Validate template if it exists
  if (sourceTask.templateId) {
    await validateTemplate(sourceTask.templateId);
  }
  
  // Step 4: Prepare task data for insertion
  const newTaskData = prepareTaskInstanceForInsert(sourceTask, targetClientId);
  
  console.log('taskCopyService: Prepared ad-hoc task data for insertion:', {
    name: newTaskData.name,
    client_id: newTaskData.client_id
  });
  
  // Step 5: Insert the new task (let database errors bubble up)
  console.log('taskCopyService: Attempting database insertion...');
  const { data, error } = await supabase
    .from('task_instances')
    .insert([newTaskData])
    .select()
    .single();
  
  if (error) {
    console.error('taskCopyService: Database insertion failed:', error);
    throw new Error(`Failed to copy ad-hoc task: ${error.message}`);
  }
  
  console.log('taskCopyService: Database insertion completed, verifying...');
  
  // Step 6: Verify the task was actually copied by querying it back
  const verifiedTask = await verifyTaskInstanceCopied(targetClientId, sourceTask.name);
  
  console.log('taskCopyService: Ad-hoc task copy completed and verified:', verifiedTask.id);
  return verifiedTask;
};

/**
 * Copy multiple tasks (both recurring and ad-hoc) to another client with enhanced error handling
 */
export const copyClientTasks = async (
  recurringTaskIds: string[],
  adHocTaskIds: string[],
  targetClientId: string
): Promise<{ recurring: RecurringTask[], adHoc: TaskInstance[] }> => {
  console.log('taskCopyService: Starting bulk copy operation with enhanced validation', {
    recurringCount: recurringTaskIds.length,
    adHocCount: adHocTaskIds.length,
    targetClientId
  });
  
  // Pre-validate target client once for all operations
  await validateTargetClient(targetClientId);
  
  const copiedRecurringTasks: RecurringTask[] = [];
  const copiedAdHocTasks: TaskInstance[] = [];
  const errors: string[] = [];
  
  // Copy recurring tasks
  if (recurringTaskIds.length > 0) {
    console.log('taskCopyService: Copying recurring tasks with verification...');
    for (const taskId of recurringTaskIds) {
      try {
        const copiedTask = await copyRecurringTask(taskId, targetClientId);
        copiedRecurringTasks.push(copiedTask);
        console.log(`taskCopyService: Successfully copied and verified recurring task: ${copiedTask.name}`);
      } catch (error) {
        const errorMsg = `Failed to copy recurring task ${taskId}: ${error instanceof Error ? error.message : String(error)}`;
        console.error('taskCopyService:', errorMsg);
        errors.push(errorMsg);
      }
    }
  }
  
  // Copy ad-hoc tasks
  if (adHocTaskIds.length > 0) {
    console.log('taskCopyService: Copying ad-hoc tasks with verification...');
    for (const taskId of adHocTaskIds) {
      try {
        const copiedTask = await copyAdHocTask(taskId, targetClientId);
        copiedAdHocTasks.push(copiedTask);
        console.log(`taskCopyService: Successfully copied and verified ad-hoc task: ${copiedTask.name}`);
      } catch (error) {
        const errorMsg = `Failed to copy ad-hoc task ${taskId}: ${error instanceof Error ? error.message : String(error)}`;
        console.error('taskCopyService:', errorMsg);
        errors.push(errorMsg);
      }
    }
  }
  
  console.log('taskCopyService: Bulk copy operation completed with verification', {
    recurringCopied: copiedRecurringTasks.length,
    adHocCopied: copiedAdHocTasks.length,
    errors: errors.length
  });
  
  // If there were errors, provide detailed feedback
  if (errors.length > 0) {
    console.error('taskCopyService: Copy operation had errors:', errors);
    
    // If ALL tasks failed, throw a comprehensive error
    if (copiedRecurringTasks.length === 0 && copiedAdHocTasks.length === 0) {
      throw new Error(`All copy operations failed:\n${errors.join('\n')}`);
    }
    
    // If some succeeded, log warnings but don't fail the operation
    console.warn('taskCopyService: Some tasks failed to copy but operation partially succeeded');
  }
  
  return {
    recurring: copiedRecurringTasks,
    adHoc: copiedAdHocTasks
  };
};
