
import { supabase } from '@/lib/supabase';

export interface StaffAvailability {
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  available_hours: number;
}

/**
 * Availability Service
 * 
 * Handles staff availability data and capacity calculations
 * FIXED: Uses correct 'status' column instead of 'is_active'
 */
export class AvailabilityService {
  /**
   * Get availability for a specific staff member
   */
  async getAvailabilityForStaff(staffId: string): Promise<StaffAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId);

      if (error) {
        console.error(`Error fetching availability for staff ${staffId}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Error in getAvailabilityForStaff:`, error);
      return [];
    }
  }

  /**
   * Calculate total weekly capacity hours for a staff member
   */
  calculateWeeklyCapacity(availability: StaffAvailability[]): number {
    return availability.reduce((total, slot) => {
      return total + (slot.available_hours || 0);
    }, 0);
  }

  /**
   * Convert weekly capacity to monthly capacity with safety measures
   * PHASE 3 FIX: Add fallbacks for missing or invalid date ranges
   */
  convertWeeklyToMonthlyCapacity(
    weeklyCapacityHours: number,
    monthStart?: Date,
    monthEnd?: Date
  ): number {
    try {
      // Validate inputs
      if (!monthStart || !monthEnd) {
        console.error('Missing month dates, using standard 4.33 weeks');
        return weeklyCapacityHours * 4.33;
      }
      
      // Check for same date (zero duration)
      const monthDurationMs = monthEnd.getTime() - monthStart.getTime();
      if (monthDurationMs <= 0) {
        console.error('Invalid date range (zero or negative duration), using standard 4.33 weeks');
        return weeklyCapacityHours * 4.33;
      }
      
      const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksInMonth = monthDurationMs / millisecondsPerWeek;
      
      // Validate reasonable week count (between 3 and 6 weeks)
      if (weeksInMonth < 3 || weeksInMonth > 6) {
        console.warn(`Unusual weeks in month: ${weeksInMonth.toFixed(2)}, using calculated value anyway`);
      }
      
      return weeklyCapacityHours * weeksInMonth;
    } catch (error) {
      console.error('Error in convertWeeklyToMonthlyCapacity:', error);
      return weeklyCapacityHours * 4.33;
    }
  }

  /**
   * Get capacity for all staff members
   * FIXED: Uses correct 'status' column instead of 'is_active'
   */
  async getAllStaffCapacities(): Promise<Record<string, number>> {
    try {
      const { data: staffMembers, error } = await supabase
        .from('staff')
        .select('id')
        .eq('status', 'active'); // FIXED: Changed from 'is_active' to 'status'

      if (error || !staffMembers) {
        console.error('Error fetching staff members:', error);
        return {};
      }

      const capacities: Record<string, number> = {};

      for (const staff of staffMembers) {
        const availability = await this.getAvailabilityForStaff(staff.id);
        capacities[staff.id] = this.calculateWeeklyCapacity(availability);
      }

      return capacities;
    } catch (error) {
      console.error('Error in getAllStaffCapacities:', error);
      return {};
    }
  }
}
