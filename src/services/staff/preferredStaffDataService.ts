
import { supabase } from '@/lib/supabaseClient';
import { StaffOption } from '@/types/staffOption';

/**
 * Preferred Staff Data Service
 * 
 * Dedicated service for fetching and managing preferred staff data.
 * This service queries the database directly to avoid duplication issues
 * that occur when extracting staff from processed demand data.
 * 
 * Phase 1: Fix Data Source and Deduplication
 */

/**
 * Cache for preferred staff options to improve performance
 */
let preferredStaffCache: StaffOption[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  return preferredStaffCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

/**
 * Clear the preferred staff cache
 */
export const clearPreferredStaffCache = (): void => {
  preferredStaffCache = null;
  cacheTimestamp = 0;
};

/**
 * Get all staff members who are assigned as preferred staff in recurring tasks
 * This is the new primary data source that queries the database directly
 */
export const getPreferredStaffFromDatabase = async (): Promise<StaffOption[]> => {
  try {
    // Return cached data if valid
    if (isCacheValid()) {
      console.log('📦 [PREFERRED STAFF DATA] Using cached preferred staff options');
      return preferredStaffCache!;
    }

    console.log('🔍 [PREFERRED STAFF DATA] Fetching preferred staff from database');
    
    // Query distinct preferred staff from recurring tasks with staff details
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select(`
        preferred_staff_id,
        staff:preferred_staff_id (
          id,
          full_name,
          status
        )
      `)
      .not('preferred_staff_id', 'is', null)
      .eq('is_active', true)
      .eq('staff.status', 'active');
    
    if (error) {
      console.error('❌ [PREFERRED STAFF DATA] Database query error:', error);
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ [PREFERRED STAFF DATA] Query returned null or invalid data');
      return [];
    }

    console.log('📊 [PREFERRED STAFF DATA] Raw query results:', {
      totalRows: data.length,
      sampleData: data.slice(0, 3)
    });

    // Process and deduplicate the results
    const staffMap = new Map<string, StaffOption>();
    
    data.forEach(record => {
      if (record.staff && 
          record.staff.id && 
          record.staff.full_name && 
          record.staff.status === 'active') {
        
        // Use Map to automatically deduplicate by staff ID
        staffMap.set(record.staff.id, {
          id: record.staff.id,
          full_name: record.staff.full_name
        });
      }
    });

    // Convert to array and sort by name
    const preferredStaffOptions = Array.from(staffMap.values())
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

    // Update cache
    preferredStaffCache = preferredStaffOptions;
    cacheTimestamp = Date.now();
    
    console.log('✅ [PREFERRED STAFF DATA] Successfully fetched and deduplicated preferred staff:', {
      uniqueStaffCount: preferredStaffOptions.length,
      totalRecords: data.length,
      deduplicationRatio: `${data.length}:${preferredStaffOptions.length}`
    });

    return preferredStaffOptions;
    
  } catch (error) {
    console.error('❌ [PREFERRED STAFF DATA] Error fetching preferred staff:', error);
    throw error;
  }
};

/**
 * Validate if a staff member is currently assigned as preferred staff
 */
export const validatePreferredStaff = async (staffId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('id')
      .eq('preferred_staff_id', staffId)
      .eq('is_active', true)
      .limit(1);
    
    if (error) {
      console.error('❌ [PREFERRED STAFF DATA] Validation error:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('❌ [PREFERRED STAFF DATA] Validation error:', error);
    return false;
  }
};

/**
 * Get preferred staff statistics for debugging and monitoring
 */
export const getPreferredStaffStatistics = async (): Promise<{
  totalPreferredAssignments: number;
  uniquePreferredStaff: number;
  activeTasksWithPreferredStaff: number;
}> => {
  try {
    // Get total preferred staff assignments
    const { count: totalAssignments } = await supabase
      .from('recurring_tasks')
      .select('*', { count: 'exact', head: true })
      .not('preferred_staff_id', 'is', null)
      .eq('is_active', true);

    // Get unique preferred staff count
    const { data: uniqueStaff } = await supabase
      .from('recurring_tasks')
      .select('preferred_staff_id')
      .not('preferred_staff_id', 'is', null)
      .eq('is_active', true);

    const uniqueStaffSet = new Set(uniqueStaff?.map(r => r.preferred_staff_id) || []);

    // Get active tasks with preferred staff
    const { count: activeTasksCount } = await supabase
      .from('recurring_tasks')
      .select('*', { count: 'exact', head: true })
      .not('preferred_staff_id', 'is', null)
      .eq('is_active', true);

    return {
      totalPreferredAssignments: totalAssignments || 0,
      uniquePreferredStaff: uniqueStaffSet.size,
      activeTasksWithPreferredStaff: activeTasksCount || 0
    };
  } catch (error) {
    console.error('❌ [PREFERRED STAFF DATA] Statistics error:', error);
    return {
      totalPreferredAssignments: 0,
      uniquePreferredStaff: 0,
      activeTasksWithPreferredStaff: 0
    };
  }
};

/**
 * Refresh preferred staff cache
 * Useful when preferred staff assignments have been updated
 */
export const refreshPreferredStaffCache = async (): Promise<StaffOption[]> => {
  clearPreferredStaffCache();
  return await getPreferredStaffFromDatabase();
};
