
/**
 * Validation utilities for template assignment operations
 */

export const validateTemplateAssignmentSelection = (
  selectedTemplateIds: string[],
  selectedClientIds: string[]
): string[] => {
  const errors: string[] = [];

  if (selectedTemplateIds.length === 0) {
    errors.push('Please select at least one template');
  }

  if (selectedClientIds.length === 0) {
    errors.push('Please select at least one client');
  }

  // Warn about large operations
  const totalOperations = selectedTemplateIds.length * selectedClientIds.length;
  if (totalOperations > 100) {
    errors.push(`Large operation detected (${totalOperations} assignments). Consider processing in smaller batches.`);
  }

  return errors;
};

export const validateAssignmentConfig = (config: any): string[] => {
  const errors: string[] = [];

  if (!config.taskType) {
    errors.push('Task type is required');
  }

  if (!config.priority) {
    errors.push('Priority is required');
  }

  if (config.taskType === 'recurring') {
    if (!config.recurrenceType) {
      errors.push('Recurrence type is required for recurring tasks');
    }
    if (!config.interval || config.interval < 1) {
      errors.push('Valid interval is required for recurring tasks');
    }
  }

  return errors;
};
