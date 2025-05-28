
import { supabase } from '@/lib/supabaseClient';
import { resolveSkillNames } from './skillResolver';
import { BatchOperation } from './types';

/**
 * Ad-Hoc Task Creator Service
 * 
 * Handles the creation of one-time task assignments from batch operations.
 * This service manages the database interaction and configuration for ad-hoc tasks.
 */

/**
 * Create an ad-hoc task assignment
 * 
 * @param operation - The batch operation containing task and client information
 * @returns Promise resolving to the created task data
 */
export const createAdHocTask = async (operation: BatchOperation): Promise<any> => {
  console.log(`Creating ad-hoc task for client ${operation.clientId}, template ${operation.templateId}`);

  // First, get the template details
  const { data: template, error: templateError } = await supabase
    .from('task_templates')
    .select('*')
    .eq('id', operation.templateId)
    .single();

  if (templateError) {
    throw new Error(`Failed to fetch template: ${templateError.message}`);
  }

  // Resolve skill IDs to names
  const templateSkills = operation.config.preserveSkills 
    ? template.required_skills 
    : template.required_skills;
  const resolvedSkills = await resolveSkillNames(templateSkills || []);

  // Prepare task instance data
  const taskInstanceData: any = {
    template_id: operation.templateId,
    client_id: operation.clientId,
    name: template.name,
    description: template.description,
    estimated_hours: operation.config.preserveEstimatedHours 
      ? template.default_estimated_hours 
      : (operation.config.estimatedHours || template.default_estimated_hours),
    required_skills: resolvedSkills, // Store skill names instead of IDs
    priority: operation.config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled'
  };

  // Add due date if specified in config
  if (operation.config.dueDate) {
    taskInstanceData.due_date = operation.config.dueDate.toISOString();
  }

  // Insert task instance
  const { data: taskInstance, error: insertError } = await supabase
    .from('task_instances')
    .insert([taskInstanceData])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create task instance: ${insertError.message}`);
  }

  console.log(`Successfully created ad-hoc task: ${taskInstance.id}`);

  return {
    type: 'adhoc',
    client_id: operation.clientId,
    template_id: operation.templateId,
    task_id: taskInstance.id,
    task_name: taskInstance.name
  };
};
