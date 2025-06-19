
import { StaffCacheManager } from './staffResolutionService/cacheManager';
import { StaffValidator } from './staffResolutionService/validator';
import { StaffDatabaseOperations } from './staffResolutionService/databaseOperations';

// Re-export types for backwards compatibility
export type { 
  StaffInfo,
  CacheEntry 
} from './staffResolutionService/cacheManager';

export type {
  StaffValidationResult,
  StaffResolutionOptions
} from './staffResolutionService/validator';

/**
 * Staff Resolution Service
 * Efficiently maps staff IDs to staff information for preferred staff features
 */
export class StaffResolutionService {
  /**
   * Resolve a single staff member by ID
   */
  static async resolveStaffById(
    staffId: string, 
    options: import('./staffResolutionService/validator').StaffResolutionOptions = {}
  ): Promise<import('./staffResolutionService/cacheManager').StaffInfo | null> {
    if (!StaffValidator.validateStaffId(staffId)) {
      return null;
    }

    const cacheKey = StaffCacheManager.generateSingleCacheKey(
      staffId, 
      options.includeInactiveStaff || false
    );
    
    // Check cache first if enabled
    if (options.enableCaching !== false) {
      const cachedStaff = StaffCacheManager.getCachedStaff(cacheKey);
      if (cachedStaff) {
        return cachedStaff;
      }
    }
    
    // Fetch from database
    const staff = await StaffDatabaseOperations.fetchStaffById(staffId, options);
    
    if (staff && options.enableCaching !== false) {
      StaffCacheManager.setCachedStaff(cacheKey, staff, options.cacheExpiry);
    }
    
    return staff;
  }

  /**
   * Bulk resolve multiple staff members by their IDs
   */
  static async bulkResolveStaff(
    staffIds: string[], 
    options: import('./staffResolutionService/validator').StaffResolutionOptions = {}
  ): Promise<Map<string, import('./staffResolutionService/cacheManager').StaffInfo>> {
    const validStaffIds = StaffValidator.validateStaffIds(staffIds);
    if (validStaffIds.length === 0) {
      return new Map();
    }

    const cacheKey = StaffCacheManager.generateBulkCacheKey(
      validStaffIds, 
      options.includeInactiveStaff || false
    );
    
    // Check cache first if enabled
    if (options.enableCaching !== false) {
      const cachedStaffMap = StaffCacheManager.getCachedBulkStaff(cacheKey);
      if (cachedStaffMap) {
        return cachedStaffMap;
      }
    }

    // Fetch from database
    const staffMap = await StaffDatabaseOperations.fetchBulkStaff(validStaffIds, options);

    if (options.enableCaching !== false) {
      StaffCacheManager.setCachedBulkStaff(cacheKey, staffMap, options.cacheExpiry);
    }

    return staffMap;
  }

  /**
   * Validate staff member and check skill matching
   */
  static async validateStaffAssignment(
    staffId: string,
    requiredSkills: string[],
    options: import('./staffResolutionService/validator').StaffResolutionOptions = {}
  ): Promise<import('./staffResolutionService/validator').StaffValidationResult> {
    const result: import('./staffResolutionService/validator').StaffValidationResult = {
      isValid: false,
      errors: []
    };

    // Resolve staff information
    const staffInfo = await this.resolveStaffById(staffId, options);
    
    if (!staffInfo) {
      result.errors.push(`Staff member with ID ${staffId} not found`);
      return result;
    }

    return StaffValidator.validateStaffAssignmentSkills(staffInfo, requiredSkills, options);
  }

  /**
   * Get all staff members with their skills
   */
  static async getAllStaff(
    options: import('./staffResolutionService/validator').StaffResolutionOptions = {}
  ): Promise<import('./staffResolutionService/cacheManager').StaffInfo[]> {
    return StaffDatabaseOperations.fetchAllStaff(options);
  }

  /**
   * Clear resolution cache
   */
  static clearCache(): void {
    StaffCacheManager.clearCache();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    singleCacheSize: number;
    bulkCacheSize: number;
    totalMemoryUsage: number;
  } {
    return StaffCacheManager.getCacheStats();
  }

  /**
   * Clean expired cache entries
   */
  static cleanExpiredCache(): void {
    StaffCacheManager.cleanExpiredCache();
  }
}

// Export individual functions for convenience
export const {
  resolveStaffById,
  bulkResolveStaff,
  validateStaffAssignment,
  getAllStaff,
  clearCache: clearStaffResolutionCache,
  getCacheStats: getStaffResolutionCacheStats,
  cleanExpiredCache: cleanExpiredStaffResolutionCache
} = StaffResolutionService;

// Auto-cleanup expired cache entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    StaffResolutionService.cleanExpiredCache();
  }, 10 * 60 * 1000);
}
