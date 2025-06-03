
import { supabase } from '@/lib/supabaseClient';
import { BatchOperation } from './types';

/**
 * Ad-Hoc Task Creator Service
 * 
 * Handles the creation of ad-hoc task instances from batch operations.
 * 
 * IMPORTANT: Skills are stored as UUIDs in the database and resolved to names only for display.
 */

/**
 * Create an ad-hoc task instance
 * 
 * @param operation - The batch operation containing task and client information
 * @returns Promise resolving to the created task data
 */
export const createAdHocTask = async (operation: BatchOperation): Promise<any> => {
  console.log(`[AdHocTaskCreator] Creating ad-hoc task for client ${operation.clientId}, template ${operation.templateId}`);

  // First, get the template details
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', operation.templateId)
    .single();

  if (templateError) {
    console.error('[AdHocTaskCreator] Failed to fetch template:', templateError);
    throw new Error(`Failed to fetch template: ${templateError.message}`);
  }

  console.log('[AdHocTaskCreator] Template fetched:', {
    templateId: template.id,
    requiredSkills: template.required_skills,
    skillsType: typeof template.required_skills,
    skillsLength: template.required_skills?.length
  });

  // CRITICAL FIX: Store skill UUIDs directly, do NOT resolve to names
  // The database schema expects UUIDs in the required_skills array
  const skillUuids = operation.config.preserveSkills 
    ? template.required_skills 
    : template.required_skills;

  console.log('[AdHocTaskCreator] Skills to store (UUIDs):', skillUuids);

  // Prepare ad-hoc task data with skill UUIDs
  const taskInstanceData: any = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.preserveEstimatedHours 
      ? template.default_estimated_hours 
      : (operation.config.estimatedHours || template.default_estimated_hours),
    required_skills: skillUuids, // Store UUIDs, NOT resolved names
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled'
  };

  // Add due date if specified in config
  if (operation.config.dueDate) {
    taskInstanceData.due_date = operation.config.dueDate.toISOString();
  }

  console.log('[AdHocTaskCreator] Inserting task instance data:', taskInstanceData);

  // Insert task instance
  const { data: taskInstance, error: insertError } = await supabase
    .from('task_instances')
    .insert([taskInstanceData])
    .select()
    .single();

  if (insertError) {
    console.error('[AdHocTaskCreator] Failed to create task instance:', insertError);
    throw new Error(`Failed to create task instance: ${insertError.message}`);
  }

  console.log(`[AdHocTaskCreator] Successfully created task instance: ${taskInstance.id}`);

  return {
    type: 'ad-hoc',
    client_id: operation.clientId,
    template_id: operation.templateId,
    task_id: taskInstance.id,
    task_name: taskInstance.name
  };
};
