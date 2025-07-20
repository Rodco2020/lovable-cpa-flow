
import { supabase } from '@/lib/supabase';
import { TimeSlotParser, ParsedTimeSlot } from './timeSlotParser';

export interface StaffAvailabilityEnhanced {
  staff_id: string;
  day_of_week: number;
  time_slot: string;
  is_available: boolean;
  parsed_slot?: ParsedTimeSlot;
  hours: number;
}

export interface WeeklyCapacitySummary {
  staffId: string;
  weeklyHours: number;
  dailyBreakdown: Array<{
    dayOfWeek: number;
    hours: number;
    timeSlots: ParsedTimeSlot[];
  }>;
}

/**
 * Enhanced Availability Service
 * Handles staff availability with proper time slot parsing and capacity calculation
 */
export class EnhancedAvailabilityService {
  /**
   * Get enhanced availability for a specific staff member with parsed time slots
   */
  async getEnhancedAvailabilityForStaff(staffId: string): Promise<StaffAvailabilityEnhanced[]> {
    try {
      console.log(`📅 [ENHANCED AVAILABILITY] Fetching availability for staff: ${staffId}`);

      const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId)
        .eq('is_available', true); // Only get available slots

      if (error) {
        console.error(`Error fetching availability for staff ${staffId}:`, error);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn(`No availability data found for staff ${staffId}`);
        return [];
      }

      // Parse time slots and calculate hours
      const enhancedAvailability = data.map(slot => {
        const parsedSlot = TimeSlotParser.parseTimeSlot(slot.time_slot);
        const hours = parsedSlot ? parsedSlot.durationHours : 0;

        if (!parsedSlot) {
          console.warn(`Failed to parse time slot for staff ${staffId}: ${slot.time_slot}`);
        }

        return {
          staff_id: slot.staff_id,
          day_of_week: slot.day_of_week,
          time_slot: slot.time_slot,
          is_available: slot.is_available,
          parsed_slot: parsedSlot || undefined,
          hours
        };
      });

      console.log(`✅ [ENHANCED AVAILABILITY] Parsed ${enhancedAvailability.length} availability slots for staff ${staffId}`);
      
      return enhancedAvailability;
    } catch (error) {
      console.error(`Error in getEnhancedAvailabilityForStaff:`, error);
      return [];
    }
  }

  /**
   * Calculate weekly capacity summary for a staff member
   */
  async calculateWeeklyCapacitySummary(staffId: string): Promise<WeeklyCapacitySummary> {
    const availability = await this.getEnhancedAvailabilityForStaff(staffId);
    
    // Group by day of week
    const dailyBreakdown = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const daySlots = availability.filter(slot => slot.day_of_week === dayOfWeek);
      const timeSlots = daySlots
        .map(slot => slot.parsed_slot)
        .filter((slot): slot is ParsedTimeSlot => slot !== undefined);
      
      const hours = daySlots.reduce((total, slot) => total + slot.hours, 0);
      
      return {
        dayOfWeek,
        hours,
        timeSlots
      };
    });

    const weeklyHours = dailyBreakdown.reduce((total, day) => total + day.hours, 0);

    console.log(`📊 [CAPACITY SUMMARY] Staff ${staffId} weekly capacity: ${weeklyHours} hours`);

    return {
      staffId,
      weeklyHours,
      dailyBreakdown
    };
  }

  /**
   * Calculate monthly capacity from weekly capacity
   */
  calculateMonthlyCapacity(
    weeklyCapacityHours: number,
    monthStart?: Date,
    monthEnd?: Date
  ): number {
    try {
      // Validate inputs
      if (!monthStart || !monthEnd) {
        console.warn('Missing month dates, using standard 4.33 weeks multiplier');
        return weeklyCapacityHours * 4.33;
      }
      
      // Check for same date (zero duration)
      const monthDurationMs = monthEnd.getTime() - monthStart.getTime();
      if (monthDurationMs <= 0) {
        console.warn('Invalid date range (zero or negative duration), using standard 4.33 weeks');
        return weeklyCapacityHours * 4.33;
      }
      
      const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeksInMonth = monthDurationMs / millisecondsPerWeek;
      
      // Validate reasonable week count (between 3 and 6 weeks)
      if (weeksInMonth < 3 || weeksInMonth > 6) {
        console.warn(`Unusual weeks in month: ${weeksInMonth.toFixed(2)}, using calculated value anyway`);
      }
      
      const monthlyCapacity = weeklyCapacityHours * weeksInMonth;
      
      console.log(`🗓️ [MONTHLY CAPACITY] Weekly: ${weeklyCapacityHours}h × ${weeksInMonth.toFixed(2)} weeks = ${monthlyCapacity.toFixed(1)}h`);
      
      return monthlyCapacity;
    } catch (error) {
      console.error('Error in calculateMonthlyCapacity:', error);
      return weeklyCapacityHours * 4.33;
    }
  }

  /**
   * Get capacity for all active staff members
   */
  async getAllStaffCapacities(): Promise<Record<string, WeeklyCapacitySummary>> {
    try {
      console.log('🔄 [ALL STAFF CAPACITY] Fetching capacity for all active staff...');

      const { data: staffMembers, error } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('status', 'active');

      if (error || !staffMembers) {
        console.error('Error fetching staff members:', error);
        return {};
      }

      const capacities: Record<string, WeeklyCapacitySummary> = {};

      // Process staff in parallel for better performance
      const capacityPromises = staffMembers.map(async (staff) => {
        const summary = await this.calculateWeeklyCapacitySummary(staff.id);
        return { staffId: staff.id, summary };
      });

      const results = await Promise.all(capacityPromises);
      
      results.forEach(({ staffId, summary }) => {
        capacities[staffId] = summary;
      });

      console.log(`✅ [ALL STAFF CAPACITY] Calculated capacity for ${Object.keys(capacities).length} staff members`);
      
      return capacities;
    } catch (error) {
      console.error('Error in getAllStaffCapacities:', error);
      return {};
    }
  }

  /**
   * Get total firm capacity for a given month
   */
  async getFirmMonthlyCapacity(monthStart: Date, monthEnd: Date): Promise<number> {
    try {
      const allStaffCapacities = await this.getAllStaffCapacities();
      
      let totalMonthlyCapacity = 0;
      
      Object.values(allStaffCapacities).forEach(summary => {
        const monthlyCapacity = this.calculateMonthlyCapacity(
          summary.weeklyHours,
          monthStart,
          monthEnd
        );
        totalMonthlyCapacity += monthlyCapacity;
      });

      console.log(`🏢 [FIRM CAPACITY] Total monthly capacity: ${totalMonthlyCapacity.toFixed(1)}h for ${Object.keys(allStaffCapacities).length} staff`);
      
      return totalMonthlyCapacity;
    } catch (error) {
      console.error('Error calculating firm monthly capacity:', error);
      return 0;
    }
  }
}
