
/**
 * Logging Service for Bulk Operations
 * 
 * Provides structured logging for debugging bulk operations issues.
 */

export class BulkOperationsLogger {
  private static logPrefix = '[BulkOps]';

  /**
   * Log skill processing steps
   */
  static logSkillProcessing(context: string, data: {
    skillIds?: string[];
    skillNames?: string[];
    operation?: string;
    stage?: string;
  }) {
    console.log(`${this.logPrefix}[${context}] Skill Processing:`, {
      stage: data.stage || 'unknown',
      operation: data.operation || 'unknown',
      skillIds: data.skillIds,
      skillNames: data.skillNames,
      skillIdsType: data.skillIds ? typeof data.skillIds[0] : 'none',
      skillIdsLength: data.skillIds?.length || 0,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log database operations
   */
  static logDatabaseOperation(table: string, operation: string, data: any, result?: any) {
    console.log(`${this.logPrefix}[DB] ${table}.${operation}:`, {
      input: data,
      result: result ? 'success' : 'pending',
      requiredSkills: data.required_skills,
      skillsType: data.required_skills ? typeof data.required_skills : 'none',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log validation errors
   */
  static logValidationError(context: string, error: any, data?: any) {
    console.error(`${this.logPrefix}[ValidationError][${context}]:`, {
      error: error.message || error,
      errorCode: error.code,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log operation flow
   */
  static logOperationFlow(stage: string, operation: any) {
    console.log(`${this.logPrefix}[Flow][${stage}]:`, {
      clientId: operation.clientId,
      templateId: operation.templateId,
      taskType: operation.config?.taskType,
      timestamp: new Date().toISOString()
    });
  }
}
