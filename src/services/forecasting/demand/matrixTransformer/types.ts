
import { RecurringTaskDB } from '@/types/task';
import { PreferredStaffInfo, PreferredStaffMetadata } from '@/types/demand';

/**
 * Core interfaces for matrix transformation with preferred staff support
 */

export interface TransformationInput {
  tasks: RecurringTaskDB[];
  clients: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>;
  skills: string[];
  months: Array<{ key: string; label: string }>;
  /**
   * NEW: Staff information for preferred staff resolution
   */
  staffMembers?: Array<{
    id: string;
    full_name: string;
    role_title?: string;
    assigned_skills: string[];
  }>;
}

export interface TaskPeriodData {
  taskId: string;
  clientId: string;
  clientName: string;
  skillType: string;
  estimatedHours: number;
  monthlyHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
  /**
   * NEW: Preferred staff information for this task period
   */
  preferredStaff?: PreferredStaffInfo;
}

export interface SkillMonthData {
  skillType: string;
  month: string;
  monthLabel: string;
  demandHours: number;
  taskCount: number;
  clientCount: number;
  taskBreakdown: TaskPeriodData[];
  /**
   * NEW: Preferred staff metadata for this skill/month combination
   */
  preferredStaffMetadata?: PreferredStaffMetadata;
}

export interface ClientRevenueInfo {
  clientId: string;
  clientName: string;
  expectedMonthlyRevenue: number;
  totalHours: number;
  totalRevenue: number;
  hourlyRate: number;
  /**
   * NEW: Preferred staff summary for this client
   */
  preferredStaffSummary?: {
    totalTasksWithPreferredStaff: number;
    uniquePreferredStaff: number;
    preferredStaffBreakdown: Array<{
      staffId: string;
      staffName: string;
      taskCount: number;
      totalHours: number;
    }>;
  };
}

export interface SkillFeeRate {
  skillName: string;
  feeRate: number;
  source: 'database' | 'fallback' | 'calculated';
}

/**
 * NEW: Interface for preferred staff processing results
 */
export interface PreferredStaffProcessingResult {
  processedTasks: Array<{
    taskId: string;
    preferredStaff: PreferredStaffInfo | null;
    resolutionStatus: 'resolved' | 'not_found' | 'invalid' | 'none';
  }>;
  staffLookupMap: Map<string, {
    id: string;
    name: string;
    roleTitle?: string;
    assignedSkills: string[];
  }>;
  statistics: {
    totalTasks: number;
    tasksWithPreferredStaff: number;
    tasksWithResolvedStaff: number;
    tasksWithUnresolvedStaff: number;
    uniquePreferredStaffCount: number;
  };
}

export interface TransformationOptions {
  includeRevenue?: boolean;
  fallbackSkillRate?: number;
  enableCaching?: boolean;
  enableValidation?: boolean;
  /**
   * NEW: Preferred staff processing options
   */
  preferredStaffOptions?: {
    enabled: boolean;
    includeRoleInfo: boolean;
    validateSkillMatching: boolean;
    fallbackToGeneric: boolean;
  };
}

export interface TransformationResult {
  dataPoints: SkillMonthData[];
  clientTotals: Map<string, number>;
  skillSummary: Record<string, {
    totalHours: number;
    taskCount: number;
    clientCount: number;
    /**
     * NEW: Preferred staff summary for skills
     */
    preferredStaffSummary?: {
      totalTasksWithPreferredStaff: number;
      uniquePreferredStaff: number;
      topPreferredStaff: Array<{
        staffId: string;
        staffName: string;
        taskCount: number;
        totalHours: number;
      }>;
    };
  }>;
  clientRevenue?: Map<string, number>;
  skillFeeRates?: Map<string, number>;
  /**
   * NEW: Preferred staff results and statistics
   */
  preferredStaffResults?: PreferredStaffProcessingResult;
  /**
   * NEW: Matrix-level preferred staff totals
   */
  preferredStaffTotals?: {
    totalTasksWithPreferredStaff: number;
    totalTasksWithoutPreferredStaff: number;
    uniquePreferredStaffCount: number;
    preferredStaffUtilization: number;
  };
  metadata: {
    processingTime: number;
    dataQuality: {
      validTasks: number;
      invalidTasks: number;
      warningCount: number;
    };
    /**
     * NEW: Preferred staff processing metadata
     */
    preferredStaffProcessing?: {
      enabled: boolean;
      resolvedStaff: number;
      unresolvedStaff: number;
      processingTime: number;
      cacheHits: number;
    };
  };
}

/**
 * NEW: Interface for staff resolution service integration
 */
export interface StaffResolutionContext {
  staffLookupService: {
    resolveStaffById: (staffId: string) => Promise<{ id: string; name: string; roleTitle?: string } | null>;
    bulkResolveStaff: (staffIds: string[]) => Promise<Map<string, { id: string; name: string; roleTitle?: string }>>;
    validateStaffSkillMatching: (staffId: string, requiredSkills: string[]) => Promise<boolean>;
  };
  cacheManager?: {
    get: (key: string) => any;
    set: (key: string, value: any, ttl?: number) => void;
    invalidate: (pattern: string) => void;
  };
}

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

/**
 * Legacy support and migration types
 */
export interface LegacyTransformationInput {
  tasks: RecurringTaskDB[];
  clients: Array<{ id: string; legal_name: string; expected_monthly_revenue: number }>;
  skills: string[];
  months: Array<{ key: string; label: string }>;
}

export interface LegacyTaskPeriodData {
  taskId: string;
  clientId: string;
  clientName: string;
  skillType: string;
  estimatedHours: number;
  monthlyHours: number;
  recurrencePattern: {
    type: string;
    interval: number;
    frequency: number;
  };
}

/**
 * Type guards and utility types
 */
export function hasPreferredStaffSupport(input: TransformationInput | LegacyTransformationInput): input is TransformationInput {
  return 'staffMembers' in input;
}

export function isPreferredStaffEnabled(options?: TransformationOptions): boolean {
  return options?.preferredStaffOptions?.enabled === true;
}

/**
 * NEW: Extended transformation input with all preferred staff data
 */
export interface EnhancedTransformationInput extends TransformationInput {
  staffMembers: Array<{
    id: string;
    full_name: string;
    role_title?: string;
    assigned_skills: string[];
    cost_per_hour?: number;
    status?: string;
  }>;
  preferredStaffResolutionContext: StaffResolutionContext;
}
