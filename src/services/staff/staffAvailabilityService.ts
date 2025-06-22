
import { supabase } from '@/lib/supabaseClient';
import { WeeklyAvailability, AvailabilitySummary, TimeSlot } from '@/types/staff';
import { SkillType } from '@/types/task';

/**
 * Staff Availability Service
 * Handles all availability-related operations for staff members
 */

/**
 * Get weekly availability by staff ID
 */
export const getWeeklyAvailabilityByStaff = async (staffId: string): Promise<WeeklyAvailability[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_availability')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week');

    if (error) {
      console.error('Error fetching weekly availability:', error);
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      staffId: item.staff_id,
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      isAvailable: item.is_available
    })) || [];
  } catch (error) {
    console.error('Failed to fetch weekly availability:', error);
    return [];
  }
};

/**
 * Batch update weekly availability
 */
export const batchUpdateWeeklyAvailability = async (
  staffId: string, 
  availabilities: Partial<WeeklyAvailability>[]
): Promise<WeeklyAvailability[]> => {
  try {
    const updates = availabilities.map(availability => ({
      staff_id: staffId,
      day_of_week: availability.dayOfWeek,
      start_time: availability.startTime,
      end_time: availability.endTime,
      is_available: availability.isAvailable
    }));

    const { data, error } = await supabase
      .from('weekly_availability')
      .upsert(updates, { onConflict: 'staff_id,day_of_week' })
      .select();

    if (error) {
      console.error('Error updating weekly availability:', error);
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      staffId: item.staff_id,
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      isAvailable: item.is_available
    })) || [];
  } catch (error) {
    console.error('Failed to update weekly availability:', error);
    throw error;
  }
};

/**
 * Calculate availability summary for a staff member
 */
export const calculateAvailabilitySummary = async (staffId: string): Promise<AvailabilitySummary> => {
  try {
    const availabilities = await getWeeklyAvailabilityByStaff(staffId);
    
    const dailySummaries = availabilities.map(availability => {
      const startTime = availability.startTime || '09:00';
      const endTime = availability.endTime || '17:00';
      
      const start = parseTime(startTime);
      const end = parseTime(endTime);
      const totalHours = availability.isAvailable ? Math.max(0, end - start) : 0;
      
      return {
        day: availability.dayOfWeek,
        totalHours,
        slots: totalHours > 0 ? [{ startTime, endTime }] : []
      };
    });

    const weeklyTotal = dailySummaries.reduce((sum, day) => sum + day.totalHours, 0);
    const averageDailyHours = dailySummaries.length > 0 ? weeklyTotal / dailySummaries.length : 0;
    const peakDay = dailySummaries.reduce((max, day) => day.totalHours > max ? day.day : max, 0);

    return {
      weeklyTotal,
      averageDailyHours,
      peakDay,
      dailySummaries
    };
  } catch (error) {
    console.error('Failed to calculate availability summary:', error);
    return {
      weeklyTotal: 0,
      averageDailyHours: 0,
      peakDay: 0,
      dailySummaries: []
    };
  }
};

/**
 * Ensure staff has availability templates (create default if missing)
 */
export const ensureStaffHasAvailability = async (staffId: string): Promise<WeeklyAvailability[]> => {
  try {
    const existing = await getWeeklyAvailabilityByStaff(staffId);
    
    if (existing.length >= 7) {
      return existing;
    }

    // Create default availability for missing days (Mon-Fri 9-5, weekend off)
    const defaultAvailability: Partial<WeeklyAvailability>[] = [];
    
    for (let day = 0; day < 7; day++) {
      const existingDay = existing.find(a => a.dayOfWeek === day);
      if (!existingDay) {
        defaultAvailability.push({
          dayOfWeek: day as any,
          startTime: day >= 1 && day <= 5 ? '09:00' : '00:00', // Mon-Fri 9am, weekend off
          endTime: day >= 1 && day <= 5 ? '17:00' : '00:00',   // Mon-Fri 5pm, weekend off
          isAvailable: day >= 1 && day <= 5 // Available Mon-Fri only
        });
      }
    }

    if (defaultAvailability.length > 0) {
      await batchUpdateWeeklyAvailability(staffId, defaultAvailability);
    }

    return getWeeklyAvailabilityByStaff(staffId);
  } catch (error) {
    console.error('Failed to ensure staff availability:', error);
    throw error;
  }
};

/**
 * Get time slots by staff and date
 */
export const getTimeSlotsByStaffAndDate = async (staffId: string, date: string): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date)
      .order('start_time');

    if (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }

    return data?.map(slot => ({
      id: slot.id,
      staffId: slot.staff_id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available,
      taskId: slot.task_id,
      date: slot.date
    })) || [];
  } catch (error) {
    console.error('Failed to fetch time slots:', error);
    return [];
  }
};

/**
 * Get time slots by date (all staff)
 */
export const getTimeSlotsByDate = async (date: string): Promise<TimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('date', date)
      .order('staff_id, start_time');

    if (error) {
      console.error('Error fetching time slots by date:', error);
      throw error;
    }

    return data?.map(slot => ({
      id: slot.id,
      staffId: slot.staff_id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isAvailable: slot.is_available,
      taskId: slot.task_id,
      date: slot.date
    })) || [];
  } catch (error) {
    console.error('Failed to fetch time slots by date:', error);
    return [];
  }
};

/**
 * Update a time slot
 */
export const updateTimeSlot = async (
  slotId: string, 
  updates: Partial<TimeSlot>
): Promise<TimeSlot | null> => {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .update({
        start_time: updates.startTime,
        end_time: updates.endTime,
        is_available: updates.isAvailable,
        task_id: updates.taskId
      })
      .eq('id', slotId)
      .select()
      .single();

    if (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }

    return {
      id: data.id,
      staffId: data.staff_id,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      taskId: data.task_id,
      date: data.date
    };
  } catch (error) {
    console.error('Failed to update time slot:', error);
    return null;
  }
};

/**
 * Map staff skills to forecast skills
 */
export const mapStaffSkillsToForecastSkills = (staffSkills: string[]): SkillType[] => {
  // Simple mapping - in a real implementation this would be more sophisticated
  const skillMap: Record<string, SkillType> = {
    'Tax Preparation': 'Tax Preparation',
    'Audit': 'Audit',
    'Advisory': 'Advisory', 
    'Bookkeeping': 'Bookkeeping',
    'Payroll': 'Payroll'
  };

  return staffSkills
    .map(skill => skillMap[skill])
    .filter(Boolean) as SkillType[];
};

/**
 * Helper function to parse time strings into hours
 */
const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + (minutes / 60);
};
