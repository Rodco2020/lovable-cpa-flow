
import { supabase } from '@/integrations/supabase/client';
import { TaskTemplate, TaskPriority, TaskCategory } from '@/types/task';
import { AssignmentConfig } from '@/components/clients/TaskWizard/AssignmentConfiguration';
import { BulkOperationConfig, BulkOperationResult, BulkOperationError, ProgressUpdate } from '@/components/clients/TaskWizard/types';
import { toast } from '@/hooks/use-toast';

export interface BulkAssignment {
  templateIds: string[];
  clientIds: string[];
  config: AssignmentConfig;
}

export interface BatchOperation {
  id: string;
  clientId: string;
  templateId: string;
  config: AssignmentConfig;
}

/**
 * Process bulk template assignments with progress tracking
 */
export const processBulkAssignments = async (
  assignment: BulkAssignment,
  operationConfig: BulkOperationConfig,
  onProgress?: (progress: ProgressUpdate) => void
): Promise<BulkOperationResult> => {
  const startTime = Date.now();
  const result: BulkOperationResult = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    errors: [],
    processingTime: 0,
    results: []
  };

  try {
    // Create batch operations
    const operations: BatchOperation[] = [];
    assignment.clientIds.forEach(clientId => {
      assignment.templateIds.forEach(templateId => {
        operations.push({
          id: `${clientId}-${templateId}`,
          clientId,
          templateId,
          config: assignment.config
        });
      });
    });

    result.totalOperations = operations.length;

    // Process operations in batches
    const batchSize = operationConfig.batchSize;
    const concurrency = operationConfig.concurrency;
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      
      // Process batch with concurrency control
      const batchPromises = batch.map(async (operation, batchIndex) => {
        try {
          // Add delay for concurrency control
          if (batchIndex >= concurrency) {
            await new Promise(resolve => setTimeout(resolve, 100 * (batchIndex - concurrency + 1)));
          }

          const operationResult = await processSingleAssignment(operation);
          result.successfulOperations++;
          result.results.push(operationResult);

          // Update progress
          if (onProgress) {
            const progress: ProgressUpdate = {
              completed: result.successfulOperations + result.failedOperations,
              total: result.totalOperations,
              currentOperation: `Processing ${operation.clientId} - ${operation.templateId}`,
              percentage: ((result.successfulOperations + result.failedOperations) / result.totalOperations) * 100,
              estimatedTimeRemaining: calculateEstimatedTime(
                startTime,
                result.successfulOperations + result.failedOperations,
                result.totalOperations
              )
            };
            onProgress(progress);
          }

          return operationResult;
        } catch (error) {
          result.failedOperations++;
          const errorDetail: BulkOperationError = {
            clientId: operation.clientId,
            templateId: operation.templateId,
            error: error instanceof Error ? error.message : String(error)
          };
          result.errors.push(errorDetail);

          // Update progress for failed operations too
          if (onProgress) {
            const progress: ProgressUpdate = {
              completed: result.successfulOperations + result.failedOperations,
              total: result.totalOperations,
              currentOperation: `Error processing ${operation.clientId} - ${operation.templateId}`,
              percentage: ((result.successfulOperations + result.failedOperations) / result.totalOperations) * 100,
              estimatedTimeRemaining: calculateEstimatedTime(
                startTime,
                result.successfulOperations + result.failedOperations,
                result.totalOperations
              )
            };
            onProgress(progress);
          }

          throw error;
        }
      });

      // Wait for batch to complete (continue on individual failures)
      await Promise.allSettled(batchPromises);
      
      // Small delay between batches to prevent overwhelming the system
      if (i + batchSize < operations.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    result.processingTime = Date.now() - startTime;

    // Show final toast
    if (result.failedOperations === 0) {
      toast({
        title: "Bulk Assignment Completed",
        description: `Successfully processed ${result.successfulOperations} assignments.`,
      });
    } else {
      toast({
        title: "Bulk Assignment Completed with Errors",
        description: `${result.successfulOperations} successful, ${result.failedOperations} failed.`,
        variant: "destructive",
      });
    }

    return result;
  } catch (error) {
    console.error('Error in bulk assignments:', error);
    result.processingTime = Date.now() - startTime;
    
    toast({
      title: "Bulk Assignment Failed",
      description: "An unexpected error occurred during bulk processing.",
      variant: "destructive",
    });

    return result;
  }
};

/**
 * Process a single assignment operation
 */
const processSingleAssignment = async (operation: BatchOperation) => {
  try {
    // Get the template details
    const { data: template, error: templateError } = await supabase
      .from('task_templates')
      .select('*')
      .eq('id', operation.templateId)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${operation.templateId}`);
    }

    if (operation.config.assignmentType === 'ad-hoc') {
      // Create ad-hoc task instance
      const taskData = {
        template_id: operation.templateId,
        client_id: operation.clientId,
        name: template.name,
        description: template.description,
        estimated_hours: operation.config.estimatedHours || template.default_estimated_hours,
        required_skills: template.required_skills,
        priority: operation.config.priority || template.default_priority,
        category: template.category,
        status: 'Unscheduled',
        due_date: operation.config.dueDate ? operation.config.dueDate.toISOString() : null,
        notes: `Created via bulk assignment from template: ${template.name}`
      };

      const { data, error: insertError } = await supabase
        .from('task_instances')
        .insert(taskData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create task: ${insertError.message}`);
      }

      return data;
    } else {
      // Create recurring task
      const recurringTaskData = {
        template_id: operation.templateId,
        client_id: operation.clientId,
        name: template.name,
        description: template.description,
        estimated_hours: operation.config.estimatedHours || template.default_estimated_hours,
        required_skills: template.required_skills,
        priority: operation.config.priority || template.default_priority,
        category: template.category,
        status: 'Unscheduled',
        recurrence_type: operation.config.recurrencePattern?.type || 'Monthly',
        recurrence_interval: operation.config.recurrencePattern?.interval || 1,
        day_of_month: operation.config.recurrencePattern?.dayOfMonth || 1,
        weekdays: operation.config.recurrencePattern?.weekdays || null,
        month_of_year: null,
        end_date: null,
        custom_offset_days: null,
        is_active: true,
        notes: `Created via bulk assignment from template: ${template.name}`
      };

      const { data, error: recurringError } = await supabase
        .from('recurring_tasks')
        .insert(recurringTaskData)
        .select()
        .single();

      if (recurringError) {
        throw new Error(`Failed to create recurring task: ${recurringError.message}`);
      }

      return data;
    }
  } catch (error) {
    console.error('Error in single assignment:', error);
    throw error;
  }
};

/**
 * Calculate estimated time remaining
 */
const calculateEstimatedTime = (startTime: number, completed: number, total: number): number => {
  if (completed === 0) return 0;
  
  const elapsed = Date.now() - startTime;
  const avgTimePerOperation = elapsed / completed;
  const remaining = total - completed;
  
  return remaining * avgTimePerOperation;
};

/**
 * Validate bulk operation before processing
 */
export const validateBulkOperation = (
  assignment: BulkAssignment,
  config: BulkOperationConfig
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (assignment.clientIds.length === 0) {
    errors.push('At least one client must be selected');
  }

  if (assignment.templateIds.length === 0) {
    errors.push('At least one template must be selected');
  }

  if (config.batchSize < 1 || config.batchSize > 100) {
    errors.push('Batch size must be between 1 and 100');
  }

  if (config.concurrency < 1 || config.concurrency > 10) {
    errors.push('Concurrency must be between 1 and 10');
  }

  const totalOperations = assignment.clientIds.length * assignment.templateIds.length;
  if (totalOperations > 1000) {
    errors.push('Maximum 1000 operations allowed per bulk assignment');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get available templates for bulk operations
 */
export const getTemplatesForBulkOperations = async (): Promise<TaskTemplate[]> => {
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
