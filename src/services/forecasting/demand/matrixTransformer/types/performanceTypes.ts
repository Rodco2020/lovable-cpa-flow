
/**
 * Performance and monitoring interfaces
 */
export interface TransformationMetrics {
  startTime: number;
  endTime: number;
  processingTime: number;
  dataPointsGenerated: number;
  clientsProcessed: number;
  skillsProcessed: number;
  tasksProcessed: number;
  /**
   * NEW: Preferred staff processing metrics
   */
  preferredStaffMetrics?: {
    staffResolutionTime: number;
    staffLookupCalls: number;
    cacheHitRate: number;
    validationTime: number;
  };
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  errors: Array<{
    type: string;
    message: string;
    context?: any;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  /**
   * NEW: Preferred staff validation results
   */
  preferredStaffValidation?: {
    invalidStaffIds: string[];
    unresolvedStaffIds: string[];
    skillMismatchWarnings: Array<{
      taskId: string;
      staffId: string;
      requiredSkills: string[];
      staffSkills: string[];
    }>;
  };
}
