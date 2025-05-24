
import { supabase } from '@/integrations/supabase/client';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { AssignmentConfig } from '@/components/clients/TaskWizard/AssignmentConfiguration';
import { toast } from '@/hooks/use-toast';

export interface TemplateAssignment {
  templateId: string;
  clientIds: string[];
  config: AssignmentConfig;
}

export interface AssignmentResult {
  success: boolean;
  tasksCreated: number;
  errors: string[];
}

/**
 * Assign templates to clients based on configuration
 */
export const assignTemplatesToClients = async (
  assignment: TemplateAssignment
): Promise<AssignmentResult> => {
  const { templateId, clientIds, config } = assignment;
  const result: AssignmentResult = {
    success: true,
    tasksCreated: 0,
    errors: []
  };

  try {
    // Get the template details
    const { data: template, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      result.errors.push(`Template not found: ${templateId}`);
      result.success = false;
      return result;
    }

    // Process each client
    for (const clientId of clientIds) {
      try {
        if (config.assignmentType === 'ad-hoc') {
          // Create ad-hoc task instance
          const taskData = {
            template_id: templateId,
            client_id: clientId,
            name: template.name,
            description: template.description,
            estimated_hours: config.estimatedHours || template.default_estimated_hours,
            required_skills: template.required_skills,
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
            result.errors.push(`Failed to create task for client ${clientId}: ${insertError.message}`);
          } else {
            result.tasksCreated++;
          }
        } else {
          // Create recurring task
          const recurringTaskData = {
            template_id: templateId,
            client_id: clientId,
            name: template.name,
            description: template.description,
            estimated_hours: config.estimatedHours || template.default_estimated_hours,
            required_skills: template.required_skills,
            priority: config.priority || template.default_priority,
            category: template.category,
            status: 'Unscheduled',
            recurrence_type: config.recurrencePattern?.type || 'Monthly',
            recurrence_interval: config.recurrencePattern?.interval || 1,
            day_of_month: config.recurrencePattern?.dayOfMonth || 1,
            weekdays: config.recurrencePattern?.weekdays || null,
            month_of_year: null,
            end_date: null,
            custom_offset_days: null,
            is_active: true,
            notes: `Created from template: ${template.name}`
          };

          const { error: recurringError } = await supabase
            .from('recurring_tasks')
            .insert(recurringTaskData);

          if (recurringError) {
            result.errors.push(`Failed to create recurring task for client ${clientId}: ${recurringError.message}`);
          } else {
            result.tasksCreated++;
          }
        }
      } catch (clientError) {
        result.errors.push(`Error processing client ${clientId}: ${clientError}`);
      }
    }

    // Update success status
    result.success = result.errors.length === 0;

    // Show appropriate toast
    if (result.success) {
      toast({
        title: "Assignment Successful",
        description: `Successfully created ${result.tasksCreated} ${config.assignmentType} task(s).`,
      });
    } else {
      toast({
        title: "Assignment Completed with Errors",
        description: `Created ${result.tasksCreated} tasks with ${result.errors.length} errors.`,
        variant: "destructive",
      });
    }

    return result;
  } catch (error) {
    console.error('Error in template assignment:', error);
    result.success = false;
    result.errors.push(`Unexpected error: ${error}`);
    
    toast({
      title: "Assignment Failed",
      description: "An unexpected error occurred during template assignment.",
      variant: "destructive",
    });

    return result;
  }
};

/**
 * Batch assign multiple templates to multiple clients
 */
export const batchAssignTemplates = async (
  assignments: TemplateAssignment[]
): Promise<AssignmentResult> => {
  const batchResult: AssignmentResult = {
    success: true,
    tasksCreated: 0,
    errors: []
  };

  for (const assignment of assignments) {
    const result = await assignTemplatesToClients(assignment);
    batchResult.tasksCreated += result.tasksCreated;
    batchResult.errors.push(...result.errors);
  }

  batchResult.success = batchResult.errors.length === 0;
  return batchResult;
};

/**
 * Get available templates for assignment
 */
export const getAvailableTemplates = async (): Promise<TaskTemplate[]> => {
  try {
    const { data: templates, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('is_archived', false)
      .order('name');

    if (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load task templates.",
        variant: "destructive",
      });
      return [];
    }

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      defaultEstimatedHours: template.default_estimated_hours,
      requiredSkills: template.required_skills || [],
      defaultPriority: template.default_priority as TaskPriority,
      category: template.category as TaskCategory,
      isArchived: template.is_archived,
      createdAt: new Date(template.created_at),
      updatedAt: new Date(template.updated_at),
      version: template.version
    }));
  } catch (error) {
    console.error('Unexpected error fetching templates:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while loading templates.",
      variant: "destructive",
    });
    return [];
  }
};
