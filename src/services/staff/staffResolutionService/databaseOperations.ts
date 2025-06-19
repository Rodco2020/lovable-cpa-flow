
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../../forecasting/logger';
import type { StaffInfo } from './cacheManager';
import type { StaffResolutionOptions } from './validator';
import { StaffValidator } from './validator';

/**
 * Database Operations for Staff Resolution Service
 * Handles all database interactions for staff data
 */
export class StaffDatabaseOperations {
  /**
   * Fetch single staff member from database
   */
  static async fetchStaffById(
    staffId: string, 
    options: StaffResolutionOptions = {}
  ): Promise<StaffInfo | null> {
    try {
      let query = supabase
        .from('staff')
        .select('id, full_name, role_title, assigned_skills, cost_per_hour, status')
        .eq('id', staffId);

      // Filter by status unless including inactive staff
      if (!options.includeInactiveStaff) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching staff by ID:', error);
        return null;
      }

      if (!data) {
        debugLog('Staff member not found', { staffId });
        return null;
      }

      const staffInfo = StaffValidator.transformDatabaseRecord(data);
      debugLog('Successfully resolved staff by ID', { staffId, staffName: staffInfo.name });
      
      return staffInfo;
    } catch (error) {
      console.error('Error in fetchStaffById:', error);
      return null;
    }
  }

  /**
   * Fetch multiple staff members from database
   */
  static async fetchBulkStaff(
    staffIds: string[], 
    options: StaffResolutionOptions = {}
  ): Promise<Map<string, StaffInfo>> {
    try {
      let query = supabase
        .from('staff')
        .select('id, full_name, role_title, assigned_skills, cost_per_hour, status')
        .in('id', staffIds);

      // Filter by status unless including inactive staff
      if (!options.includeInactiveStaff) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error bulk fetching staff:', error);
        return new Map();
      }

      if (!data || data.length === 0) {
        debugLog('No staff members found for provided IDs', { staffIds });
        return new Map();
      }

      const staffMap = new Map<string, StaffInfo>();

      data.forEach(staff => {
        const staffInfo = StaffValidator.transformDatabaseRecord(staff);
        staffMap.set(staff.id, staffInfo);
      });

      debugLog('Successfully bulk resolved staff', { 
        requested: staffIds.length, 
        resolved: staffMap.size 
      });

      return staffMap;
    } catch (error) {
      console.error('Error in fetchBulkStaff:', error);
      return new Map();
    }
  }

  /**
   * Fetch all staff members from database
   */
  static async fetchAllStaff(options: StaffResolutionOptions = {}): Promise<StaffInfo[]> {
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

      const staffList: StaffInfo[] = data.map(staff => 
        StaffValidator.transformDatabaseRecord(staff)
      );

      debugLog('Successfully fetched all staff', { count: staffList.length });
      return staffList;
    } catch (error) {
      console.error('Error in fetchAllStaff:', error);
      return [];
    }
  }
}
