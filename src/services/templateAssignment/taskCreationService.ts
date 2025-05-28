
import { supabase } from '@/integrations/supabase/client';
import { getAllSkills } from '@/services/skillService';
import { AssignmentConfig } from '@/components/clients/TaskWizard/AssignmentConfiguration';

/**
 * Task Creation Service
 * 
 * Handles the creation of ad-hoc and recurring tasks from templates.
 */

/**
 * Resolve skill IDs to skill names
 */
const resolveSkillNames = async (skillIds: string[]): Promise<string[]> => {
  if (!skillIds || skillIds.length === 0) return [];
  
  try {
    const skills = await getAllSkills();
    const skillsMap = skills.reduce((map, skill) => {
      map[skill.id] = skill.name;
      return map;
    }, {} as Record<string, string>);
    
    // Convert skill IDs to names, fallback to ID if name not found
    return skillIds.map(skillId => skillsMap[skillId] || skillId);
  } catch (error) {
    console.error('Error resolving skill names:', error);
    // Fallback to returning the original skill IDs if resolution fails
    return skillIds;
  }
};

/**
 * Create an ad-hoc task instance from template
 */
export const createAdHocTask = async (
  templateId: string,
  clientId: string,
  template: any,
  config: AssignmentConfig
) => {
  // Resolve skill IDs to names
  const resolvedSkills = await resolveSkillNames(template.required_skills || []);
  
  const taskData = {
    template_id: templateId,
    client_id: clientId,
    name: template.name,
    description: template.description,
    estimated_hours: config.estimatedHours || template.default_estimated_hours,
    required_skills: resolvedSkills, // Store skill names instead of IDs
    priority: config.priority || template.default_priority,
    category: template.category,
    status: 'Unscheduled',
    due_date: config.dueDate ? config.dueDate.toISOString() : null,
    notes: `Created from template: ${template.name}`
  };

  const { error: insertError } = await supabase
    .from('task_instances')
    .insert(taskData);

  if (insertError) {
    throw new Error(`Failed to create task for client ${clientId}: ${insertError.message}`);
  }
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
  // Resolve skill IDs to names
  const resolvedSkills = await resolveSkillNames(template.required_skills || []);
  
  const recurringTaskData = {
    template_id: templateId,
    client_id: clientId,
    name: template.name,
    description: template.description,
    estimated_hours: config.estimatedHours || template.default_estimated_hours,
    required_skills: resolvedSkills, // Store skill names instead of IDs
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

  const { error: recurringError } = await supabase
    .from('recurring_tasks')
    .insert(recurringTaskData);

  if (recurringError) {
    throw new Error(`Failed to create recurring task for client ${clientId}: ${recurringError.message}`);
  }
};
