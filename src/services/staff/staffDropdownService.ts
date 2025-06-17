
import { supabase } from '@/lib/supabaseClient';
import { StaffOption } from '@/types/staffOption';

/**
 * Staff Dropdown Service
 * 
 * Specialized service for retrieving staff data optimized for dropdown components.
 * Provides efficient data fetching with caching and filtering for active staff members.
 */

/**
 * Cache for staff options to improve performance
 */
let staffOptionsCache: StaffOption[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if cache is still valid
 */
const isCacheValid = (): boolean => {
  return staffOptionsCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

/**
 * Clear the staff options cache
 */
export const clearStaffOptionsCache = (): void => {
  staffOptionsCache = null;
  cacheTimestamp = 0;
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
 * Includes role information for validation purposes
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
