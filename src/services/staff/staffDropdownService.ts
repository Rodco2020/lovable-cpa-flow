
import { supabase } from '@/lib/supabaseClient';
import { StaffOption } from '@/types/staffOption';

/**
 * Optimized Staff Dropdown Service
 * Provides efficient staff data retrieval for dropdown components
 */

/**
 * Get active staff members formatted for dropdown usage
 * Uses caching-friendly query structure
 */
export const getActiveStaffForDropdown = async (): Promise<StaffOption[]> => {
  try {
    console.log('🔍 [Staff Dropdown Service] Fetching active staff for dropdown');
    
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active')
      .order('full_name')
      .range(0, 999); // Ensure we get all active staff

    if (error) {
      console.error('❌ [Staff Dropdown Service] Error fetching staff:', error);
      return [];
    }

    if (!data || !Array.isArray(data)) {
      console.warn('⚠️ [Staff Dropdown Service] No staff data returned');
      return [];
    }

    // Validate and format staff data
    const validStaff = data
      .filter(staff => 
        staff && 
        typeof staff.id === 'string' && 
        typeof staff.full_name === 'string' &&
        staff.id.trim().length > 0 &&
        staff.full_name.trim().length > 0
      )
      .map(staff => ({
        id: staff.id.trim(),
        full_name: staff.full_name.trim()
      }));

    console.log(`✅ [Staff Dropdown Service] Fetched ${validStaff.length} active staff members`);
    return validStaff;

  } catch (error) {
    console.error('💥 [Staff Dropdown Service] Unexpected error:', error);
    return [];
  }
};

/**
 * Get staff member by ID with validation
 */
export const getStaffById = async (staffId: string): Promise<StaffOption | null> => {
  try {
    if (!staffId || typeof staffId !== 'string' || staffId.trim().length === 0) {
      console.warn('⚠️ [Staff Dropdown Service] Invalid staff ID provided');
      return null;
    }

    console.log(`🔍 [Staff Dropdown Service] Fetching staff by ID: ${staffId}`);
    
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('id', staffId.trim())
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('❌ [Staff Dropdown Service] Error fetching staff by ID:', error);
      return null;
    }

    if (!data) {
      console.warn(`⚠️ [Staff Dropdown Service] No staff found with ID: ${staffId}`);
      return null;
    }

    console.log(`✅ [Staff Dropdown Service] Found staff: ${data.full_name}`);
    return {
      id: data.id,
      full_name: data.full_name
    };

  } catch (error) {
    console.error('💥 [Staff Dropdown Service] Unexpected error fetching staff by ID:', error);
    return null;
  }
};

/**
 * Validate staff ID format (UUID)
 */
export const validateStaffId = (staffId: string): boolean => {
  if (!staffId || typeof staffId !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(staffId.trim());
};
