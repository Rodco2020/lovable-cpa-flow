
import { BulkAssignment } from './types';
import { validateTemplatesForBulkOperations } from './templateDataService';
import { supabase } from '@/lib/supabaseClient';

/**
 * Validation Service for Bulk Operations
 * 
 * Provides comprehensive validation for bulk operation requests
 * to ensure data integrity and prevent invalid operations.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a bulk operation request
 * 
 * Performs comprehensive validation of the bulk assignment request
 * including template validation, client validation, and configuration checks.
 */
export const validateBulkOperation = async (assignment: BulkAssignment): Promise<ValidationResult> => {
  console.log('Validating bulk operation request');
  
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Validate basic structure
    if (!assignment.templateIds || assignment.templateIds.length === 0) {
      errors.push('At least one template must be selected');
    }

    if (!assignment.clientIds || assignment.clientIds.length === 0) {
      errors.push('At least one client must be selected');
    }

    if (!assignment.config) {
      errors.push('Assignment configuration is required');
    }

    // Return early if basic validation fails
    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Validate templates
    const templateValidation = await validateTemplatesForBulkOperations(assignment.templateIds);
    if (templateValidation.invalid.length > 0) {
      errors.push(`Invalid templates: ${templateValidation.invalid.join(', ')}`);
    }

    // Validate clients
    const clientValidation = await validateClients(assignment.clientIds);
    if (clientValidation.invalid.length > 0) {
      errors.push(`Invalid clients: ${clientValidation.invalid.join(', ')}`);
    }

    // Validate configuration
    const configValidation = validateAssignmentConfig(assignment.config);
    errors.push(...configValidation.errors);
    warnings.push(...configValidation.warnings);

    // Check for operation scale warnings
    const totalOperations = assignment.templateIds.length * assignment.clientIds.length;
    if (totalOperations > 100) {
      warnings.push(`Large operation detected: ${totalOperations} assignments will be created`);
    }

    // Check for potential duplicates
    const duplicateCheck = await checkForPotentialDuplicates(assignment);
    if (duplicateCheck.duplicates.length > 0) {
      warnings.push(`Potential duplicates detected: ${duplicateCheck.duplicates.length} existing assignments may be duplicated`);
    }

    console.log(`Validation complete: ${errors.length} errors, ${warnings.length} warnings`);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    console.error('Validation failed with error:', error);
    errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return { isValid: false, errors, warnings };
  }
};

/**
 * Validate client IDs
 */
const validateClients = async (clientIds: string[]): Promise<{
  valid: string[];
  invalid: string[];
}> => {
  console.log(`Validating ${clientIds.length} clients`);

  const { data, error } = await supabase
    .from('clients')
    .select('id, status')
    .in('id', clientIds);

  if (error) {
    console.error('Error validating clients:', error);
    throw new Error(`Failed to validate clients: ${error.message}`);
  }

  const foundClients = data || [];
  const foundIds = foundClients.map(c => c.id);
  const invalidIds = clientIds.filter(id => !foundIds.includes(id));

  // Filter out inactive clients
  const activeClients = foundClients
    .filter(client => client.status === 'Active')
    .map(c => c.id);

  const inactiveClients = foundClients
    .filter(client => client.status !== 'Active')
    .map(c => c.id);

  const allInvalidIds = [...invalidIds, ...inactiveClients];

  return {
    valid: activeClients,
    invalid: allInvalidIds
  };
};

/**
 * Validate assignment configuration
 */
const validateAssignmentConfig = (config: any): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

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

    if (config.recurrenceType === 'Weekly' && (!config.weekdays || config.weekdays.length === 0)) {
      errors.push('Weekdays must be specified for weekly recurring tasks');
    }

    if (config.recurrenceType === 'Monthly' && (!config.dayOfMonth || config.dayOfMonth < 1 || config.dayOfMonth > 31)) {
      errors.push('Valid day of month must be specified for monthly recurring tasks');
    }

    if (config.recurrenceType === 'Annually') {
      if (!config.dayOfMonth || config.dayOfMonth < 1 || config.dayOfMonth > 31) {
        errors.push('Valid day of month must be specified for annual recurring tasks');
      }
      if (!config.monthOfYear || config.monthOfYear < 1 || config.monthOfYear > 12) {
        errors.push('Valid month must be specified for annual recurring tasks');
      }
    }
  }

  return { errors, warnings };
};

/**
 * Check for potential duplicate assignments
 */
const checkForPotentialDuplicates = async (assignment: BulkAssignment): Promise<{
  duplicates: Array<{ clientId: string; templateId: string; taskName: string }>;
}> => {
  console.log('Checking for potential duplicate assignments');

  const duplicates: Array<{ clientId: string; templateId: string; taskName: string }> = [];

  try {
    // Check for existing recurring tasks with same template and client combinations
    if (assignment.config.taskType === 'recurring') {
      const { data: existingRecurring, error } = await supabase
        .from('recurring_tasks')
        .select('client_id, template_id, name')
        .in('client_id', assignment.clientIds)
        .in('template_id', assignment.templateIds)
        .eq('is_active', true);

      if (!error && existingRecurring) {
        duplicates.push(...existingRecurring.map(task => ({
          clientId: task.client_id,
          templateId: task.template_id,
          taskName: task.name
        })));
      }
    }

    // Check for recent ad-hoc tasks with same template and client combinations
    if (assignment.config.taskType === 'adhoc') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: existingAdHoc, error } = await supabase
        .from('task_instances')
        .select('client_id, template_id, name')
        .in('client_id', assignment.clientIds)
        .in('template_id', assignment.templateIds)
        .gte('created_at', oneMonthAgo.toISOString())
        .is('recurring_task_id', null);

      if (!error && existingAdHoc) {
        duplicates.push(...existingAdHoc.map(task => ({
          clientId: task.client_id,
          templateId: task.template_id,
          taskName: task.name
        })));
      }
    }

    console.log(`Found ${duplicates.length} potential duplicates`);
    return { duplicates };

  } catch (error) {
    console.error('Error checking for duplicates:', error);
    // Don't fail validation for duplicate check errors
    return { duplicates: [] };
  }
};
