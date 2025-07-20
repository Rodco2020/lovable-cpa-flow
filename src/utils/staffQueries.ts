
import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized staff query utilities to ensure consistent schema usage
 * This utility fixes the schema mismatch where services were using 'is_active' 
 * instead of the correct 'status' column
 */
export const staffQueries = {
  /**
   * Get all active staff members
   */
  async getActiveStaff() {
    console.log('🔍 [STAFF QUERIES] Fetching active staff members...');
    
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('❌ [STAFF QUERIES] Error fetching active staff:', error);
      throw error;
    }
    
    console.log(`✅ [STAFF QUERIES] Successfully fetched ${data?.length || 0} active staff members`);
    return data || [];
  },

  /**
   * Check if a staff member is active
   */
  isActiveStaff(staff: { status: string }): boolean {
    return staff.status === 'active';
  },

  /**
   * Get active staff query builder (for complex queries)
   */
  activeStaffQuery() {
    return supabase
      .from('staff')
      .select('*')
      .eq('status', 'active');
  }
};
