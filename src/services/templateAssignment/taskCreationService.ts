
import { supabase } from '@/integrations/supabase/client';
import { AssignmentConfig } from '@/components/clients/TaskWizard/AssignmentConfiguration';

/**
 * Task Creation Service - Updated for UUID-based skill system
 * 
 * Handles the creation of ad-hoc and recurring tasks from templates.
 * 
 * IMPORTANT: Skills are stored as UUIDs in the database, not as names.
 */

/**
 * Create an ad-hoc task instance from template
 */
export const createAdHocTask = async (
  templateId: string,
  clientId: string,
  template: any,
  config: AssignmentConfig
) => {
  console.log('[TemplateAssignment] Creating ad-hoc task with UUID skills:', {
    templateId,
    clientId,
    templateSkills: template.required_skills
  });

  // CRITICAL FIX: Store skill UUIDs directly, do NOT resolve to names
  // The template.required_skills already contains UUIDs from the database
  const skillUuids = template.required_skills || [];

  console.log('[TemplateAssignment] Skills to store (UUIDs):', skillUuids);
  
  const taskData = {
    template_id: templateId,
    client_id: clientId,
    name: template.name,
    description: template.description,
    estimated_hours: config.estimatedHours || template.default_estimated_hours,
    required_skills: skillUuids, // Store UUIDs directly
    priority: config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled',
    due_date: config.dueDate ? config.dueDate.toISOString() : null,
    notes: `Created from template: ${template.name}`
  };

  console.log('[TemplateAssignment] Inserting ad-hoc task data:', taskData);

  const { error: insertError } = await supabase
    .from('task_instances')
    .insert(taskData);

  if (insertError) {
    console.error('[TemplateAssignment] Failed to create ad-hoc task:', insertError);
    throw new Error(`Failed to create task for client ${clientId}: ${insertError.message}`);
  }

  console.log('[TemplateAssignment] Successfully created ad-hoc task');
};

/**
 * Create a recurring task from template
 */
export const createRecurringTask = async (
  templateId: string,
  clientId: string,
  template: any,
  config: AssignmentConfig
) => {
  console.log('[TemplateAssignment] Creating recurring task with UUID skills:', {
    templateId,
    clientId,
    templateSkills: template.required_skills
  });

  // CRITICAL FIX: Store skill UUIDs directly, do NOT resolve to names
  // The template.required_skills already contains UUIDs from the database
  const skillUuids = template.required_skills || [];

  console.log('[TemplateAssignment] Skills to store (UUIDs):', skillUuids);
  
  const recurringTaskData = {
    template_id: templateId,
    client_id: clientId,
    name: template.name,
    description: template.description,
    estimated_hours: config.estimatedHours || template.default_estimated_hours,
    required_skills: skillUuids, // Store UUIDs directly
    priority: config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled',
    recurrence_type: config.recurrencePattern?.type || config.recurrenceType || 'Monthly',
    recurrence_interval: config.recurrencePattern?.interval || config.interval || 1,
    day_of_month: config.recurrencePattern?.dayOfMonth || config.dayOfMonth || null,
    weekdays: config.recurrencePattern?.weekdays || config.weekdays || null,
    month_of_year: config.recurrencePattern?.monthOfYear || config.monthOfYear || null,
    due_date: config.dueDate ? config.dueDate.toISOString() : null,
    end_date: null,
    custom_offset_days: null,
    is_active: true,
    notes: `Created from template: ${template.name}`
  };

  console.log('[TemplateAssignment] Inserting recurring task data:', recurringTaskData);

  const { error: recurringError } = await supabase
    .from('recurring_tasks')
    .insert(recurringTaskData);

  if (recurringError) {
    console.error('[TemplateAssignment] Failed to create recurring task:', recurringError);
    throw new Error(`Failed to create recurring task for client ${clientId}: ${recurringError.message}`);
  }

  console.log('[TemplateAssignment] Successfully created recurring task');
};
