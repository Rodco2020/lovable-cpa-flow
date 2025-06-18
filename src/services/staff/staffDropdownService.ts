
/**
 * Staff Dropdown Service
 * 
 * Provides optimized staff data retrieval for dropdown components.
 * Returns minimal required data for performance and caches results
 * for improved user experience.
 * 
 * @module StaffDropdownService
 */

import { supabase } from '@/integrations/supabase/client';
import { StaffOption } from '@/types/staffOption';

// Cache for staff options
let staffOptionsCache: StaffOption[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clears the staff options cache
 * Used when staff data is modified to ensure fresh data is fetched
 */
export const clearStaffOptionsCache = (): void => {
  staffOptionsCache = null;
  cacheTimestamp = null;
};

/**
 * Checks if the cache is still valid
 */
const isCacheValid = (): boolean => {
  if (!staffOptionsCache || !cacheTimestamp) {
    return false;
  }
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

/**
 * Fetches active staff members optimized for dropdown component usage
 * 
 * Features:
 * - Returns only active staff members
 * - Minimal data payload (id, full_name only)
 * - Sorted alphabetically by name
 * - Comprehensive error handling
 * - Caching for improved performance
 * 
 * @returns Promise<StaffOption[]> Array of staff options for dropdown
 * @throws Error with descriptive message if fetch fails
 * 
 * @example
 * ```typescript
 * const staffOptions = await getActiveStaffForDropdown();
 * // Returns: [{ id: 'uuid', full_name: 'John Doe' }, ...]
 * ```
 */
export const getActiveStaffForDropdown = async (): Promise<StaffOption[]> => {
  // Return cached data if valid
  if (isCacheValid() && staffOptionsCache) {
    return staffOptionsCache;
  }

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(`Database error fetching staff: ${error.message}`);
    }

    const result = data || [];
    
    // Update cache
    staffOptionsCache = result;
    cacheTimestamp = Date.now();

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch staff for dropdown: ${errorMessage}`);
  }
};
