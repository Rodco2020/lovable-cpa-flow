
import { supabase } from '@/lib/supabaseClient';
import { StaffOption } from '@/types/staffOption';

/**
 * Staff Liaison Service
 * 
 * Functionality for retrieving staff information for client liaison dropdowns
 */

/**
 * Get staff members for liaison dropdown
 * @returns Promise resolving to array of StaffOption objects
 * @throws Error if database error occurs
 */
export const getStaffForLiaisonDropdown = async (): Promise<StaffOption[]> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active')
      .order('full_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching staff for dropdown:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getStaffForLiaisonDropdown:', error);
    throw error;
  }
};
