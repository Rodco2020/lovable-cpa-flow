
import { TemplateAssignment, AssignmentResult, AssignmentOperation } from './types';
import { fetchTemplateById } from './templateDataService';
import { createAdHocTask, createRecurringTask } from './taskCreationService';
import { toast } from '@/hooks/use-toast';

/**
 * Assignment Processor
 * 
 * Core logic for processing template assignments to clients.
 */

/**
 * Process a single assignment operation
 */
export const processSingleAssignment = async (
  operation: AssignmentOperation
): Promise<void> => {
  const { templateId, clientId, config, templateData } = operation;

  try {
    if (config.assignmentType === 'ad-hoc') {
      await createAdHocTask(templateId, clientId, templateData, config);
    } else {
      await createRecurringTask(templateId, clientId, templateData, config);
    }
  } catch (error) {
    throw new Error(`Error processing client ${clientId}: ${error}`);
  }
};

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
    const template = await fetchTemplateById(templateId);

    // Process each client
    for (const clientId of clientIds) {
      try {
        const operation: AssignmentOperation = {
          templateId,
          clientId,
          config,
          templateData: template
        };

        await processSingleAssignment(operation);
        result.tasksCreated++;
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
