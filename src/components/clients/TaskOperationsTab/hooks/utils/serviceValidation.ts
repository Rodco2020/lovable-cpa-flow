
/**
 * Service Validation Utilities
 * 
 * Provides validation functions to ensure proper service layer integration
 * and compatibility with the copy workflow.
 */

import { Client } from '@/types/client';
import { TaskInstance, RecurringTask } from '@/types/task';

/**
 * Validates that a client ID is properly formatted and not empty
 */
export const validateClientId = (clientId: string | null | undefined): boolean => {
  return !!(clientId && typeof clientId === 'string' && clientId.trim().length > 0);
};

/**
 * Validates that source and target clients are different
 */
export const validateClientsDifferent = (
  sourceClientId: string | null,
  targetClientId: string | null
): boolean => {
  if (!validateClientId(sourceClientId) || !validateClientId(targetClientId)) {
    return false;
  }
  return sourceClientId !== targetClientId;
};

/**
 * Validates that task IDs array is not empty and contains valid IDs
 */
export const validateTaskIds = (taskIds: string[]): boolean => {
  return Array.isArray(taskIds) && 
         taskIds.length > 0 && 
         taskIds.every(id => typeof id === 'string' && id.trim().length > 0);
};

/**
 * Validates client data structure for service compatibility
 */
export const validateClientData = (client: any): client is Client => {
  return !!(
    client &&
    typeof client === 'object' &&
    validateClientId(client.id) &&
    typeof client.legalName === 'string' &&
    typeof client.status === 'string'
  );
};

/**
 * Validates task instance data structure
 */
export const validateTaskInstance = (task: any): task is TaskInstance => {
  return !!(
    task &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.name === 'string' &&
    typeof task.clientId === 'string' &&
    typeof task.estimatedHours === 'number'
  );
};

/**
 * Validates recurring task data structure
 */
export const validateRecurringTask = (task: any): task is RecurringTask => {
  return !!(
    task &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.name === 'string' &&
    typeof task.clientId === 'string' &&
    typeof task.estimatedHours === 'number' &&
    task.recurrencePattern &&
    typeof task.recurrencePattern.type === 'string'
  );
};

/**
 * Validates copy operation parameters before calling service
 */
export const validateCopyOperationParams = (
  recurringTaskIds: string[],
  adHocTaskIds: string[],
  targetClientId: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateClientId(targetClientId)) {
    errors.push('Target client ID is required and must be valid');
  }

  if (!Array.isArray(recurringTaskIds)) {
    errors.push('Recurring task IDs must be an array');
  }

  if (!Array.isArray(adHocTaskIds)) {
    errors.push('Ad-hoc task IDs must be an array');
  }

  if (recurringTaskIds.length === 0 && adHocTaskIds.length === 0) {
    errors.push('At least one task must be selected for copying');
  }

  // Validate individual task IDs
  const invalidRecurringIds = recurringTaskIds.filter(id => !validateClientId(id));
  if (invalidRecurringIds.length > 0) {
    errors.push(`Invalid recurring task IDs: ${invalidRecurringIds.join(', ')}`);
  }

  const invalidAdHocIds = adHocTaskIds.filter(id => !validateClientId(id));
  if (invalidAdHocIds.length > 0) {
    errors.push(`Invalid ad-hoc task IDs: ${invalidAdHocIds.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates service response data structure
 */
export const validateCopyServiceResponse = (response: any): boolean => {
  return !!(
    response &&
    typeof response === 'object' &&
    Array.isArray(response.recurring) &&
    Array.isArray(response.adHoc) &&
    response.recurring.every(validateRecurringTask) &&
    response.adHoc.every(validateTaskInstance)
  );
};

/**
 * Creates a comprehensive validation report for debugging
 */
export const createValidationReport = (
  sourceClientId: string | null,
  targetClientId: string | null,
  selectedTaskIds: string[],
  clients: Client[]
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate client IDs
  if (!validateClientId(sourceClientId)) {
    errors.push('Source client ID is invalid or missing');
  }

  if (!validateClientId(targetClientId)) {
    errors.push('Target client ID is invalid or missing');
  }

  if (!validateClientsDifferent(sourceClientId, targetClientId)) {
    errors.push('Source and target clients must be different');
  }

  // Validate task selection
  if (!validateTaskIds(selectedTaskIds)) {
    errors.push('Task selection is invalid or empty');
  }

  // Validate client data
  const sourceClient = clients.find(c => c.id === sourceClientId);
  const targetClient = clients.find(c => c.id === targetClientId);

  if (sourceClientId && !sourceClient) {
    errors.push('Source client not found in available clients');
  }

  if (targetClientId && !targetClient) {
    errors.push('Target client not found in available clients');
  }

  // Check for warnings
  if (selectedTaskIds.length > 50) {
    warnings.push('Large number of tasks selected - operation may take some time');
  }

  if (sourceClient && targetClient && sourceClient.industry !== targetClient.industry) {
    warnings.push('Source and target clients are in different industries');
  }

  const isValid = errors.length === 0;
  const summary = isValid 
    ? `Validation passed: ${selectedTaskIds.length} tasks ready to copy from ${sourceClient?.legalName} to ${targetClient?.legalName}`
    : `Validation failed with ${errors.length} error(s)`;

  return {
    isValid,
    errors,
    warnings,
    summary
  };
};
