
import { supabase } from '@/lib/supabase';

export interface StaffAvailability {
  staff_id: string;
  day_of_week: number;
  time_slot: string;
  is_available: boolean;
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
        .select('time_slot, is_available, day_of_week, staff_id')
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
   * Parse time slot string to calculate hours
   * Example: "09:00-12:00" returns 3.0 hours
   */
  private parseTimeSlot(timeSlot: string): number {
    try {
      const [start, end] = timeSlot.split('-');
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return (endMinutes - startMinutes) / 60;
    } catch (error) {
      console.error(`Error parsing time slot "${timeSlot}":`, error);
      return 0;
    }
  }

  /**
   * Calculate total weekly capacity hours for a staff member
   * FIXED: Now uses actual database schema with time_slot and is_available
   */
  calculateWeeklyCapacity(availability: StaffAvailability[]): number {
    return availability.reduce((total, slot) => {
      // Only count available slots
      if (slot.is_available) {
        const hours = this.parseTimeSlot(slot.time_slot);
        return total + hours;
      }
      return total;
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
