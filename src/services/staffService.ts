
import { supabase } from '@/lib/supabaseClient';
import { Staff, StaffOption, WeeklyAvailability, AvailabilitySummary, TimeSlot } from '@/types/staff';

/**
 * Enhanced Staff Service with all required functions
 * Phase 1: Staff Data Service Integration with comprehensive functionality
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
 * Fetch all staff members (active and inactive)
 */
export const getAllStaff = async (): Promise<Staff[]> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Error fetching all staff:', error);
      return [];
    }

    return data?.map(staff => ({
      id: staff.id,
      fullName: staff.full_name,
      roleTitle: staff.role_title || '',
      skills: staff.skills || [],
      assignedSkills: staff.assigned_skills || [],
      costPerHour: staff.cost_per_hour || 0,
      email: staff.email || '',
      phone: staff.phone || '',
      status: staff.status as 'active' | 'inactive',
      createdAt: new Date(staff.created_at),
      updatedAt: new Date(staff.updated_at)
    })) || [];
  } catch (err) {
    console.error('Unexpected error fetching all staff:', err);
    return [];
  }
};

/**
 * Get staff member by ID
 */
export const getStaffById = async (staffId: string): Promise<Staff | null> => {
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single();

    if (error || !data) {
      console.warn(`Staff member with ID ${staffId} not found`);
      return null;
    }

    return {
      id: data.id,
      fullName: data.full_name,
      roleTitle: data.role_title || '',
      skills: data.skills || [],
      assignedSkills: data.assigned_skills || [],
      costPerHour: data.cost_per_hour || 0,
      email: data.email || '',
      phone: data.phone || '',
      status: data.status as 'active' | 'inactive',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (err) {
    console.error('Error fetching staff by ID:', err);
    return null;
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

/**
 * Get time slots by staff member and date
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
      return [];
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
  } catch (err) {
    console.error('Unexpected error fetching time slots:', err);
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
      .order('staff_id', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching time slots by date:', error);
      return [];
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
  } catch (err) {
    console.error('Unexpected error fetching time slots by date:', err);
    return [];
  }
};

/**
 * Update a time slot
 */
export const updateTimeSlot = async (timeSlot: Partial<TimeSlot>): Promise<TimeSlot | null> => {
  try {
    const { data, error } = await supabase
      .from('time_slots')
      .update({
        start_time: timeSlot.startTime,
        end_time: timeSlot.endTime,
        is_available: timeSlot.isAvailable,
        task_id: timeSlot.taskId
      })
      .eq('id', timeSlot.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating time slot:', error);
      return null;
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
  } catch (err) {
    console.error('Unexpected error updating time slot:', err);
    return null;
  }
};

/**
 * Get weekly availability by staff
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
      return [];
    }

    return data?.map(availability => ({
      id: availability.id,
      staffId: availability.staff_id,
      dayOfWeek: availability.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: availability.start_time,
      endTime: availability.end_time,
      isAvailable: availability.is_available
    })) || [];
  } catch (err) {
    console.error('Unexpected error fetching weekly availability:', err);
    return [];
  }
};

/**
 * Batch update weekly availability
 */
export const batchUpdateWeeklyAvailability = async (availabilities: WeeklyAvailability[]): Promise<void> => {
  try {
    const updates = availabilities.map(availability => ({
      id: availability.id,
      staff_id: availability.staffId,
      day_of_week: availability.dayOfWeek,
      start_time: availability.startTime,
      end_time: availability.endTime,
      is_available: availability.isAvailable
    }));

    const { error } = await supabase
      .from('weekly_availability')
      .upsert(updates);

    if (error) {
      console.error('Error batch updating weekly availability:', error);
      throw error;
    }
  } catch (err) {
    console.error('Unexpected error batch updating weekly availability:', err);
    throw err;
  }
};

/**
 * Calculate availability summary for a staff member
 */
export const calculateAvailabilitySummary = async (staffId: string): Promise<AvailabilitySummary> => {
  try {
    const availability = await getWeeklyAvailabilityByStaff(staffId);
    
    let weeklyTotal = 0;
    const dailySummaries: Array<{
      day: number;
      totalHours: number;
      slots: Array<{ startTime: string; endTime: string; }>;
    }> = [];

    // Group by day and calculate hours
    for (let day = 0; day <= 6; day++) {
      const dayAvailability = availability.filter(a => a.dayOfWeek === day && a.isAvailable);
      
      let dayTotal = 0;
      const slots: Array<{ startTime: string; endTime: string; }> = [];
      
      dayAvailability.forEach(slot => {
        if (slot.startTime && slot.endTime) {
          const start = new Date(`1970-01-01T${slot.startTime}`);
          const end = new Date(`1970-01-01T${slot.endTime}`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          dayTotal += hours;
          
          slots.push({
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }
      });
      
      weeklyTotal += dayTotal;
      dailySummaries.push({
        day,
        totalHours: dayTotal,
        slots
      });
    }

    // Find peak day
    const peakDay = dailySummaries.reduce((peak, current) => 
      current.totalHours > peak.totalHours ? current : peak
    ).day;

    return {
      weeklyTotal,
      averageDailyHours: weeklyTotal / 7,
      peakDay,
      dailySummaries
    };
  } catch (err) {
    console.error('Error calculating availability summary:', err);
    return {
      weeklyTotal: 0,
      averageDailyHours: 0,
      peakDay: 0,
      dailySummaries: []
    };
  }
};

/**
 * Ensure staff has availability templates
 */
export const ensureStaffHasAvailability = async (staffId: string): Promise<WeeklyAvailability[]> => {
  try {
    const existing = await getWeeklyAvailabilityByStaff(staffId);
    
    if (existing.length > 0) {
      return existing;
    }

    // Create default availability template (9 AM to 5 PM, Monday to Friday)
    const defaultAvailability: WeeklyAvailability[] = [];
    
    for (let day = 1; day <= 5; day++) { // Monday to Friday
      defaultAvailability.push({
        staffId,
        dayOfWeek: day as 1 | 2 | 3 | 4 | 5,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      });
    }

    await batchUpdateWeeklyAvailability(defaultAvailability);
    return defaultAvailability;
  } catch (err) {
    console.error('Error ensuring staff availability:', err);
    return [];
  }
};
