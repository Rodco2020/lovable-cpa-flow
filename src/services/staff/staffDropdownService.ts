
import { supabase } from '@/lib/supabaseClient';
import { StaffOption } from '@/types/staffOption';

/**
 * Staff Dropdown Service
 * 
 * Specialized service for retrieving staff data optimized for dropdown components.
 * Provides efficient data fetching with caching and filtering for active staff members.
 * Enhanced to support preferred staff filtering scenarios.
 */

/**
 * Cache for staff options to improve performance
 */
let staffOptionsCache: StaffOption[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Cache for preferred staff from demand data
 */
let preferredStaffCache: Map<string, { id: string; name: string }[]> = new Map();
let preferredStaffCacheTimestamp: number = 0;

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  return staffOptionsCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

/**
 * Check if preferred staff cache is valid
 */
const isPreferredStaffCacheValid = (): boolean => {
  return (Date.now() - preferredStaffCacheTimestamp) < CACHE_DURATION;
};

/**
 * Clear the staff options cache
 */
export const clearStaffOptionsCache = (): void => {
  staffOptionsCache = null;
  cacheTimestamp = 0;
  // Also clear preferred staff cache
  preferredStaffCache.clear();
  preferredStaffCacheTimestamp = 0;
};

/**
 * Fetch active staff members optimized for dropdown usage
 * Returns only essential fields: id, full_name, role_title
 * Includes caching for performance optimization
 */
export const getActiveStaffForDropdown = async (): Promise<StaffOption[]> => {
  try {
    // Return cached data if valid
    if (isCacheValid()) {
      console.log('Using cached staff options');
      return staffOptionsCache!;
    }

    console.log('Fetching fresh staff options for dropdown');
    
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, role_title')
      .eq('status', 'active')
      .order('full_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching active staff for dropdown:', error);
      throw error;
    }
    
    // Transform to StaffOption format and filter out invalid entries
    const staffOptions: StaffOption[] = (data || [])
      .filter(staff => 
        staff && 
        staff.id && 
        staff.full_name && 
        staff.full_name.trim() !== ''
      )
      .map(staff => ({
        id: staff.id,
        full_name: staff.full_name
      }));
    
    // Update cache
    staffOptionsCache = staffOptions;
    cacheTimestamp = Date.now();
    
    console.log(`Fetched ${staffOptions.length} active staff members for dropdown`);
    return staffOptions;
  } catch (error) {
    console.error('Error in getActiveStaffForDropdown:', error);
    throw error;
  }
};

/**
 * Get staff member details by ID for task editing workflow
 * Enhanced to support preferred staff resolution
 */
export const getStaffMemberForTaskAssignment = async (staffId: string): Promise<{
  id: string;
  full_name: string;
  role_title: string;
  status: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, role_title, status')
      .eq('id', staffId)
      .eq('status', 'active')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching staff member for task assignment:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getStaffMemberForTaskAssignment:', error);
    throw error;
  }
};

/**
 * Get preferred staff options from demand data with caching
 * Optimized for demand matrix filtering scenarios
 */
export const getPreferredStaffFromDemandData = async (
  demandDataPoints: any[]
): Promise<{ id: string; name: string }[]> => {
  try {
    const cacheKey = `demand_${demandDataPoints.length}_${JSON.stringify(demandDataPoints.slice(0, 3))}`;
    
    // Check cache first
    if (isPreferredStaffCacheValid() && preferredStaffCache.has(cacheKey)) {
      console.log('Using cached preferred staff from demand data');
      return preferredStaffCache.get(cacheKey)!;
    }

    console.log('Processing preferred staff from demand data');
    
    // Extract unique preferred staff from demand data
    const preferredStaffSet = new Set<string>();
    const staffInfoMap = new Map<string, string>();
    
    demandDataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach((task: any) => {
          if (task.preferredStaff?.staffId && task.preferredStaff?.staffName) {
            preferredStaffSet.add(task.preferredStaff.staffId);
            staffInfoMap.set(task.preferredStaff.staffId, task.preferredStaff.staffName);
          }
        });
      }
    });
    
    // Convert to array format
    const preferredStaffOptions = Array.from(preferredStaffSet).map(staffId => ({
      id: staffId,
      name: staffInfoMap.get(staffId) || 'Unknown Staff'
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    // Update cache
    preferredStaffCache.set(cacheKey, preferredStaffOptions);
    preferredStaffCacheTimestamp = Date.now();
    
    console.log(`Extracted ${preferredStaffOptions.length} preferred staff from demand data`);
    return preferredStaffOptions;
  } catch (error) {
    console.error('Error in getPreferredStaffFromDemandData:', error);
    return [];
  }
};

/**
 * Validate if a staff member is active and available for task assignment
 */
export const validateStaffForTaskAssignment = async (staffId: string): Promise<boolean> => {
  try {
    const staffMember = await getStaffMemberForTaskAssignment(staffId);
    return staffMember !== null && staffMember.status === 'active';
  } catch (error) {
    console.error('Error validating staff for task assignment:', error);
    return false;
  }
};

/**
 * Refresh staff options cache
 * Useful when staff data has been updated
 */
export const refreshStaffOptionsCache = async (): Promise<StaffOption[]> => {
  clearStaffOptionsCache();
  return await getActiveStaffForDropdown();
};

/**
 * Get cache statistics including preferred staff cache
 */
export const getStaffCacheStatistics = (): {
  staffOptionsCount: number;
  preferredStaffCacheEntries: number;
  cacheAge: number;
  preferredStaffCacheAge: number;
} => {
  return {
    staffOptionsCount: staffOptionsCache?.length || 0,
    preferredStaffCacheEntries: preferredStaffCache.size,
    cacheAge: cacheTimestamp > 0 ? Date.now() - cacheTimestamp : 0,
    preferredStaffCacheAge: preferredStaffCacheTimestamp > 0 ? Date.now() - preferredStaffCacheTimestamp : 0
  };
};
