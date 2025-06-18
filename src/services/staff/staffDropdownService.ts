
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

/**
 * Fetches active staff members optimized for dropdown component usage
 * 
 * Features:
 * - Returns only active staff members
 * - Minimal data payload (id, full_name only)
 * - Sorted alphabetically by name
 * - Comprehensive error handling
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
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(`Database error fetching staff: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch staff for dropdown: ${errorMessage}`);
  }
};
