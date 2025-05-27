
import { supabase } from '@/lib/supabaseClient';
import { logError } from '@/services/errorLoggingService';

/**
 * Data Validation Service
 * 
 * Ensures data consistency, validates business rules,
 * and maintains data integrity across the system
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface DataConsistencyReport {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  issues: DataIssue[];
  recommendations: string[];
}

export interface DataIssue {
  type: 'orphaned_data' | 'missing_reference' | 'invalid_value' | 'business_rule_violation';
  description: string;
  affectedRecords: string[];
  severity: 'high' | 'medium' | 'low';
  autoFixable: boolean;
}

class DataValidationService {
  /**
   * Validate client data for completeness and correctness
   */
  async validateClient(clientData: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Required fields validation
      if (!clientData.legal_name?.trim()) {
        errors.push({
          field: 'legal_name',
          message: 'Legal name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!clientData.email?.trim()) {
        errors.push({
          field: 'email',
          message: 'Email is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      } else if (!this.isValidEmail(clientData.email)) {
        errors.push({
          field: 'email',
          message: 'Invalid email format',
          code: 'INVALID_FORMAT',
          severity: 'error'
        });
      }

      // Business rule validation
      if (clientData.expected_monthly_revenue && clientData.expected_monthly_revenue < 0) {
        errors.push({
          field: 'expected_monthly_revenue',
          message: 'Expected monthly revenue cannot be negative',
          code: 'INVALID_VALUE',
          severity: 'error'
        });
      }

      if (!clientData.expected_monthly_revenue || clientData.expected_monthly_revenue === 0) {
        warnings.push({
          field: 'expected_monthly_revenue',
          message: 'No expected monthly revenue set',
          suggestion: 'Consider setting expected revenue for better forecasting'
        });
      }

      // Check for duplicate email
      if (clientData.email) {
        const isDuplicate = await this.checkDuplicateEmail(clientData.email, clientData.id);
        if (isDuplicate) {
          errors.push({
            field: 'email',
            message: 'Email already exists for another client',
            code: 'DUPLICATE_VALUE',
            severity: 'error'
          });
        }
      }

      // Staff liaison validation
      if (clientData.staff_liaison_id) {
        const isValidLiaison = await this.validateStaffLiaison(clientData.staff_liaison_id);
        if (!isValidLiaison) {
          errors.push({
            field: 'staff_liaison_id',
            message: 'Invalid staff liaison reference',
            code: 'INVALID_REFERENCE',
            severity: 'error'
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logError('Client validation failed', 'error', {
        component: 'DataValidationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        errors: [{
          field: 'system',
          message: 'Validation system error',
          code: 'SYSTEM_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Validate task data for business rules and consistency
   */
  async validateTask(taskData: any, isRecurring: boolean = false): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Required fields
      if (!taskData.name?.trim()) {
        errors.push({
          field: 'name',
          message: 'Task name is required',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      }

      if (!taskData.estimated_hours || taskData.estimated_hours <= 0) {
        errors.push({
          field: 'estimated_hours',
          message: 'Estimated hours must be greater than 0',
          code: 'INVALID_VALUE',
          severity: 'error'
        });
      }

      // Skills validation
      if (!taskData.required_skills || !Array.isArray(taskData.required_skills) || taskData.required_skills.length === 0) {
        errors.push({
          field: 'required_skills',
          message: 'At least one required skill must be specified',
          code: 'REQUIRED_FIELD',
          severity: 'error'
        });
      } else {
        const validSkills = await this.validateSkills(taskData.required_skills);
        if (!validSkills.isValid) {
          errors.push({
            field: 'required_skills',
            message: 'One or more skills are invalid',
            code: 'INVALID_REFERENCE',
            severity: 'error'
          });
        }
      }

      // Client reference validation
      if (taskData.client_id) {
        const isValidClient = await this.validateClientReference(taskData.client_id);
        if (!isValidClient) {
          errors.push({
            field: 'client_id',
            message: 'Invalid client reference',
            code: 'INVALID_REFERENCE',
            severity: 'error'
          });
        }
      }

      // Recurring task specific validation
      if (isRecurring) {
        if (!taskData.recurrence_type) {
          errors.push({
            field: 'recurrence_type',
            message: 'Recurrence type is required for recurring tasks',
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }

        if (taskData.recurrence_type === 'Monthly' && !taskData.day_of_month) {
          errors.push({
            field: 'day_of_month',
            message: 'Day of month is required for monthly recurrence',
            code: 'REQUIRED_FIELD',
            severity: 'error'
          });
        }
      }

      // Business rule warnings
      if (taskData.estimated_hours > 40) {
        warnings.push({
          field: 'estimated_hours',
          message: 'Task exceeds 40 hours',
          suggestion: 'Consider breaking down large tasks into smaller ones'
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logError('Task validation failed', 'error', {
        component: 'DataValidationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isValid: false,
        errors: [{
          field: 'system',
          message: 'Validation system error',
          code: 'SYSTEM_ERROR',
          severity: 'error'
        }],
        warnings: []
      };
    }
  }

  /**
   * Perform comprehensive data consistency check
   */
  async performConsistencyCheck(): Promise<DataConsistencyReport> {
    const issues: DataIssue[] = [];
    const recommendations: string[] = [];
    let totalChecks = 0;
    let passedChecks = 0;

    try {
      // Check 1: Orphaned recurring tasks
      totalChecks++;
      const orphanedRecurringTasks = await this.findOrphanedRecurringTasks();
      if (orphanedRecurringTasks.length === 0) {
        passedChecks++;
      } else {
        issues.push({
          type: 'orphaned_data',
          description: 'Recurring tasks without valid client references',
          affectedRecords: orphanedRecurringTasks.map(t => t.id),
          severity: 'high',
          autoFixable: false
        });
      }

      // Check 2: Task instances without templates
      totalChecks++;
      const instancesWithoutTemplates = await this.findTaskInstancesWithoutTemplates();
      if (instancesWithoutTemplates.length === 0) {
        passedChecks++;
      } else {
        issues.push({
          type: 'missing_reference',
          description: 'Task instances with invalid template references',
          affectedRecords: instancesWithoutTemplates.map(t => t.id),
          severity: 'medium',
          autoFixable: false
        });
      }

      // Check 3: Clients without expected revenue
      totalChecks++;
      const clientsWithoutRevenue = await this.findClientsWithoutRevenue();
      if (clientsWithoutRevenue.length === 0) {
        passedChecks++;
      } else {
        issues.push({
          type: 'invalid_value',
          description: 'Clients without expected monthly revenue',
          affectedRecords: clientsWithoutRevenue.map(c => c.id),
          severity: 'low',
          autoFixable: false
        });
        recommendations.push('Set expected monthly revenue for all active clients to improve forecasting accuracy');
      }

      // Check 4: Invalid skill references
      totalChecks++;
      const invalidSkillRefs = await this.findInvalidSkillReferences();
      if (invalidSkillRefs.length === 0) {
        passedChecks++;
      } else {
        issues.push({
          type: 'invalid_value',
          description: 'Tasks with invalid skill references',
          affectedRecords: invalidSkillRefs.map(t => t.id),
          severity: 'medium',
          autoFixable: true
        });
      }

      // Check 5: Business rule violations
      totalChecks++;
      const businessRuleViolations = await this.findBusinessRuleViolations();
      if (businessRuleViolations.length === 0) {
        passedChecks++;
      } else {
        issues.push({
          type: 'business_rule_violation',
          description: 'Records violating business rules',
          affectedRecords: businessRuleViolations.map(v => v.id),
          severity: 'medium',
          autoFixable: false
        });
      }

      return {
        totalChecks,
        passedChecks,
        failedChecks: totalChecks - passedChecks,
        issues,
        recommendations
      };
    } catch (error) {
      logError('Data consistency check failed', 'error', {
        component: 'DataValidationService',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async checkDuplicateEmail(email: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('clients')
      .select('id')
      .eq('email', email);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return (data?.length || 0) > 0;
  }

  private async validateStaffLiaison(staffId: string): Promise<boolean> {
    const { data } = await supabase
      .from('staff')
      .select('id')
      .eq('id', staffId)
      .eq('status', 'active')
      .single();

    return !!data;
  }

  private async validateSkills(skillNames: string[]): Promise<{ isValid: boolean; invalidSkills: string[] }> {
    const { data: existingSkills } = await supabase
      .from('skills')
      .select('name')
      .in('name', skillNames);

    const existingSkillNames = existingSkills?.map(s => s.name) || [];
    const invalidSkills = skillNames.filter(skill => !existingSkillNames.includes(skill));

    return {
      isValid: invalidSkills.length === 0,
      invalidSkills
    };
  }

  private async validateClientReference(clientId: string): Promise<boolean> {
    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();

    return !!data;
  }

  private async findOrphanedRecurringTasks(): Promise<any[]> {
    const { data } = await supabase
      .from('recurring_tasks')
      .select(`
        id,
        client_id,
        clients!left(id)
      `)
      .is('clients.id', null);

    return data || [];
  }

  private async findTaskInstancesWithoutTemplates(): Promise<any[]> {
    const { data } = await supabase
      .from('task_instances')
      .select(`
        id,
        template_id,
        task_templates!left(id)
      `)
      .is('task_templates.id', null);

    return data || [];
  }

  private async findClientsWithoutRevenue(): Promise<any[]> {
    const { data } = await supabase
      .from('clients')
      .select('id, legal_name')
      .eq('status', 'Active')
      .or('expected_monthly_revenue.is.null,expected_monthly_revenue.eq.0');

    return data || [];
  }

  private async findInvalidSkillReferences(): Promise<any[]> {
    // This would require a more complex query to check skill arrays
    // For now, return empty array
    return [];
  }

  private async findBusinessRuleViolations(): Promise<any[]> {
    const violations = [];

    // Check for tasks with negative hours
    const { data: negativeHourTasks } = await supabase
      .from('recurring_tasks')
      .select('id')
      .lt('estimated_hours', 0);

    if (negativeHourTasks) {
      violations.push(...negativeHourTasks);
    }

    return violations;
  }
}

export const dataValidationService = new DataValidationService();
export default dataValidationService;
