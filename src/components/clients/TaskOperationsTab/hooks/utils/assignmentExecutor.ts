
import { TaskTemplate } from '@/types/task';
import { AssignmentConfig } from '../../../TaskWizard/AssignmentConfiguration';
import { assignTemplatesToClients } from '@/services/templateAssignmentService';
import { toast } from '@/hooks/use-toast';
import { OperationProgress, OperationResults, calculateProgress } from './progressTracker';

/**
 * Executes template assignment operation with progress tracking
 */
export const executeTemplateAssignment = async (
  selectedTemplateIds: string[],
  selectedClientIds: string[],
  assignmentConfig: AssignmentConfig,
  availableTemplates: TaskTemplate[],
  setProgress: (progress: OperationProgress) => void
): Promise<OperationResults> => {
  const totalOperations = selectedTemplateIds.length * selectedClientIds.length;
  let completedOperations = 0;
  const results: OperationResults = {
    tasksCreated: 0,
    errors: [],
    success: true
  };

  const startTime = Date.now();

  // Initialize progress
  setProgress({
    completed: 0,
    total: totalOperations,
    percentage: 0,
    currentOperation: 'Starting assignment...'
  });

  // Process each template
  for (const templateId of selectedTemplateIds) {
    const template = availableTemplates.find(t => t.id === templateId);
    
    // Update current operation
    const currentProgress = calculateProgress(completedOperations, totalOperations, startTime);
    setProgress({
      completed: currentProgress.completed || completedOperations,
      total: currentProgress.total || totalOperations,
      percentage: currentProgress.percentage || 0,
      currentOperation: `Assigning template: ${template?.name || templateId}...`,
      estimatedTimeRemaining: currentProgress.estimatedTimeRemaining
    });

    try {
      const result = await assignTemplatesToClients({
        templateId,
        clientIds: selectedClientIds,
        config: assignmentConfig
      });

      results.tasksCreated += result.tasksCreated;
      results.errors.push(...result.errors);

      completedOperations += selectedClientIds.length;
      
      const progressUpdate = calculateProgress(completedOperations, totalOperations, startTime);
      setProgress({
        completed: progressUpdate.completed || completedOperations,
        total: progressUpdate.total || totalOperations,
        percentage: progressUpdate.percentage || 0,
        estimatedTimeRemaining: progressUpdate.estimatedTimeRemaining
      });

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`Error assigning template ${templateId}:`, error);
      results.errors.push(`Failed to assign template ${template?.name || templateId}: ${error}`);
      completedOperations += selectedClientIds.length;
    }
  }

  results.success = results.errors.length === 0;

  // Final progress update
  setProgress({
    completed: totalOperations,
    total: totalOperations,
    percentage: 100,
    currentOperation: 'Assignment complete'
  });

  // Show completion toast
  if (results.success) {
    toast({
      title: "Assignment Successful",
      description: `Successfully created ${results.tasksCreated} tasks.`,
    });
  } else {
    toast({
      title: "Assignment Completed with Errors",
      description: `Created ${results.tasksCreated} tasks with ${results.errors.length} errors.`,
      variant: "destructive",
    });
  }

  return results;
};
