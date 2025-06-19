
import { PreferredStaffInfo } from '@/types/demand';

/**
 * Interfaces for preferred staff processing results
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

/**
 * Interface for staff resolution service integration
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
