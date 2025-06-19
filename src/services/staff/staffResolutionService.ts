
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../forecasting/logger';

/**
 * Staff Resolution Service
 * Efficiently maps staff IDs to staff information for preferred staff features
 */

export interface StaffInfo {
  id: string;
  name: string;
  roleTitle?: string;
  assignedSkills: string[];
  costPerHour?: number;
  status?: string;
}

export interface StaffResolutionOptions {
  enableCaching?: boolean;
  cacheExpiry?: number; // milliseconds
  includeInactiveStaff?: boolean;
  validateSkillMatching?: boolean;
}

export interface StaffValidationResult {
  isValid: boolean;
  staffInfo?: StaffInfo;
  errors: string[];
  skillMatches?: {
    required: string[];
    available: string[];
    matched: string[];
    missing: string[];
  };
}

export class StaffResolutionService {
  private static cache = new Map<string, { data: StaffInfo; expiry: number }>();
  private static bulkCache = new Map<string, { data: Map<string, StaffInfo>; expiry: number }>();
  private static defaultCacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Resolve a single staff member by ID
   */
  static async resolveStaffById(
    staffId: string, 
    options: StaffResolutionOptions = {}
  ): Promise<StaffInfo | null> {
    if (!staffId || typeof staffId !== 'string') {
      debugLog('Invalid staff ID provided to resolveStaffById', { staffId });
      return null;
    }

    const cacheKey = `staff_${staffId}_${options.includeInactiveStaff || false}`;
    
    // Check cache first if enabled
    if (options.enableCaching !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        debugLog('Staff resolution cache hit', { staffId });
        return cached.data;
      }
    }

    try {
      let query = supabase
        .from('staff')
        .select('id, full_name, role_title, assigned_skills, cost_per_hour, status')
        .eq('id', staffId)
        .single();

      // Filter by status unless including inactive staff
      if (!options.includeInactiveStaff) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error resolving staff by ID:', error);
        return null;
      }

      if (!data) {
        debugLog('Staff member not found', { staffId });
        return null;
      }

      const staffInfo: StaffInfo = {
        id: data.id,
        name: data.full_name,
        roleTitle: data.role_title || undefined,
        assignedSkills: Array.isArray(data.assigned_skills) ? data.assigned_skills : [],
        costPerHour: data.cost_per_hour ? Number(data.cost_per_hour) : undefined,
        status: data.status
      };

      // Cache the result if caching is enabled
      if (options.enableCaching !== false) {
        const expiry = Date.now() + (options.cacheExpiry || this.defaultCacheExpiry);
        this.cache.set(cacheKey, { data: staffInfo, expiry });
      }

      debugLog('Successfully resolved staff by ID', { staffId, staffName: staffInfo.name });
      return staffInfo;

    } catch (error) {
      console.error('Error in resolveStaffById:', error);
      return null;
    }
  }

  /**
   * Bulk resolve multiple staff members by their IDs
   */
  static async bulkResolveStaff(
    staffIds: string[], 
    options: StaffResolutionOptions = {}
  ): Promise<Map<string, StaffInfo>> {
    if (!Array.isArray(staffIds) || staffIds.length === 0) {
      debugLog('Invalid or empty staff IDs array provided to bulkResolveStaff');
      return new Map();
    }

    // Filter out invalid IDs
    const validStaffIds = staffIds.filter(id => id && typeof id === 'string');
    if (validStaffIds.length === 0) {
      debugLog('No valid staff IDs found in array');
      return new Map();
    }

    const cacheKey = `bulk_${validStaffIds.sort().join(',')}_${options.includeInactiveStaff || false}`;
    
    // Check cache first if enabled
    if (options.enableCaching !== false) {
      const cached = this.bulkCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        debugLog('Bulk staff resolution cache hit', { staffCount: validStaffIds.length });
        return cached.data;
      }
    }

    try {
      let query = supabase
        .from('staff')
        .select('id, full_name, role_title, assigned_skills, cost_per_hour, status')
        .in('id', validStaffIds);

      // Filter by status unless including inactive staff
      if (!options.includeInactiveStaff) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error bulk resolving staff:', error);
        return new Map();
      }

      if (!data || data.length === 0) {
        debugLog('No staff members found for provided IDs', { staffIds: validStaffIds });
        return new Map();
      }

      const staffMap = new Map<string, StaffInfo>();

      data.forEach(staff => {
        const staffInfo: StaffInfo = {
          id: staff.id,
          name: staff.full_name,
          roleTitle: staff.role_title || undefined,
          assignedSkills: Array.isArray(staff.assigned_skills) ? staff.assigned_skills : [],
          costPerHour: staff.cost_per_hour ? Number(staff.cost_per_hour) : undefined,
          status: staff.status
        };
        staffMap.set(staff.id, staffInfo);
      });

      // Cache the result if caching is enabled
      if (options.enableCaching !== false) {
        const expiry = Date.now() + (options.cacheExpiry || this.defaultCacheExpiry);
        this.bulkCache.set(cacheKey, { data: staffMap, expiry });
      }

      debugLog('Successfully bulk resolved staff', { 
        requested: validStaffIds.length, 
        resolved: staffMap.size 
      });

      return staffMap;

    } catch (error) {
      console.error('Error in bulkResolveStaff:', error);
      return new Map();
    }
  }

  /**
   * Validate staff member and check skill matching
   */
  static async validateStaffAssignment(
    staffId: string,
    requiredSkills: string[],
    options: StaffResolutionOptions = {}
  ): Promise<StaffValidationResult> {
    const result: StaffValidationResult = {
      isValid: false,
      errors: []
    };

    // Resolve staff information
    const staffInfo = await this.resolveStaffById(staffId, options);
    
    if (!staffInfo) {
      result.errors.push(`Staff member with ID ${staffId} not found`);
      return result;
    }

    result.staffInfo = staffInfo;

    // Validate skill matching if requested
    if (options.validateSkillMatching && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      const staffSkills = staffInfo.assignedSkills || [];
      const matched = requiredSkills.filter(skill => staffSkills.includes(skill));
      const missing = requiredSkills.filter(skill => !staffSkills.includes(skill));

      result.skillMatches = {
        required: requiredSkills,
        available: staffSkills,
        matched,
        missing
      };

      if (missing.length > 0) {
        result.errors.push(`Staff member ${staffInfo.name} is missing required skills: ${missing.join(', ')}`);
      }
    }

    // Check if staff is active
    if (staffInfo.status !== 'active' && !options.includeInactiveStaff) {
      result.errors.push(`Staff member ${staffInfo.name} is not active`);
    }

    result.isValid = result.errors.length === 0;

    debugLog('Staff validation completed', {
      staffId,
      staffName: staffInfo.name,
      isValid: result.isValid,
      errorCount: result.errors.length
    });

    return result;
  }

  /**
   * Get all staff members with their skills
   */
  static async getAllStaff(options: StaffResolutionOptions = {}): Promise<StaffInfo[]> {
    try {
      let query = supabase
        .from('staff')
        .select('id, full_name, role_title, assigned_skills, cost_per_hour, status')
        .order('full_name');

      // Filter by status unless including inactive staff
      if (!options.includeInactiveStaff) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all staff:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      const staffList: StaffInfo[] = data.map(staff => ({
        id: staff.id,
        name: staff.full_name,
        roleTitle: staff.role_title || undefined,
        assignedSkills: Array.isArray(staff.assigned_skills) ? staff.assigned_skills : [],
        costPerHour: staff.cost_per_hour ? Number(staff.cost_per_hour) : undefined,
        status: staff.status
      }));

      debugLog('Successfully fetched all staff', { count: staffList.length });
      return staffList;

    } catch (error) {
      console.error('Error in getAllStaff:', error);
      return [];
    }
  }

  /**
   * Clear resolution cache
   */
  static clearCache(): void {
    this.cache.clear();
    this.bulkCache.clear();
    debugLog('Staff resolution cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    singleCacheSize: number;
    bulkCacheSize: number;
    totalMemoryUsage: number;
  } {
    const singleCacheSize = this.cache.size;
    const bulkCacheSize = this.bulkCache.size;
    
    // Rough estimation of memory usage
    const totalMemoryUsage = (singleCacheSize * 200) + (bulkCacheSize * 1000); // bytes

    return {
      singleCacheSize,
      bulkCacheSize,
      totalMemoryUsage
    };
  }

  /**
   * Clean expired cache entries
   */
  static cleanExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;

    // Clean single cache
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    // Clean bulk cache
    for (const [key, value] of this.bulkCache.entries()) {
      if (value.expiry < now) {
        this.bulkCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      debugLog('Cleaned expired cache entries', { entriesCleaned: cleaned });
    }
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
