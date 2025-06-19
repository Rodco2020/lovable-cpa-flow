
import { supabase } from '@/lib/supabaseClient';
import { Staff, StaffOption } from '@/types/staff';

/**
 * Phase 1: Staff Data Service Integration
 * NEW: Service for fetching preferred staff members from recurring tasks
 */

/**
 * Fetch all staff members who are assigned as preferred staff in recurring tasks
 * Returns unique staff members who have been selected as preferred for at least one active task
 */
export const getPreferredStaffMembers = async (): Promise<StaffOption[]> => {
  try {
    console.log('🔍 [staffService] Fetching preferred staff members from recurring tasks');
    
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select(`
        preferred_staff_id,
        staff!inner(
          id,
          full_name,
          status
        )
      `)
      .eq('is_active', true)
      .not('preferred_staff_id', 'is', null)
      .eq('staff.status', 'active');

    if (error) {
      console.error('❌ [staffService] Error fetching preferred staff members:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ [staffService] No preferred staff members found in active recurring tasks');
      return [];
    }

    // Extract unique staff members (avoid duplicates if a staff member is preferred for multiple tasks)
    const uniqueStaffMap = new Map<string, StaffOption>();
    
    data.forEach(taskData => {
      if (taskData.staff && taskData.preferred_staff_id) {
        const staffMember = taskData.staff;
        if (!uniqueStaffMap.has(staffMember.id)) {
          uniqueStaffMap.set(staffMember.id, {
            id: staffMember.id,
            full_name: staffMember.full_name
          });
        }
      }
    });

    const preferredStaffMembers = Array.from(uniqueStaffMap.values());
    
    console.log(`✅ [staffService] Found ${preferredStaffMembers.length} unique preferred staff members`);
    return preferredStaffMembers;
    
  } catch (err) {
    console.error('💥 [staffService] Unexpected error fetching preferred staff members:', err);
    return [];
  }
};

/**
 * Fetch all active staff members for general use
 */
export const getAllActiveStaff = async (): Promise<StaffOption[]> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name')
      .eq('status', 'active')
      .order('full_name');

    if (error) {
      console.error('Error fetching active staff:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching active staff:', err);
    return [];
  }
};

/**
 * Get staff member name by ID (utility function for display purposes)
 */
export const getStaffNameById = async (staffId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('full_name')
      .eq('id', staffId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.warn(`Staff member with ID ${staffId} not found or inactive`);
      return null;
    }

    return data.full_name;
  } catch (err) {
    console.error('Error fetching staff name:', err);
    return null;
  }
};
