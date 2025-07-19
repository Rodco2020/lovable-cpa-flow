import { v4 as uuidv4 } from "uuid";
import { WeeklyAvailability, AvailabilitySummary } from "@/types/staff";
import { supabase } from "@/integrations/supabase/client";
import { SkillType } from "@/types/task";
import { normalizeSkills } from "../skillNormalizationService";

/**
 * Staff Availability Management
 * Functions to handle staff weekly availability templates and summaries
 */

/**
 * Get weekly availability for a staff member
 * @param staffId The UUID of the staff member
 * @returns Promise resolving to an array of weekly availability records
 */
export const getWeeklyAvailabilityByStaff = async (staffId: string): Promise<WeeklyAvailability[]> => {
  try {
    console.log(`Fetching availability for staff ${staffId}`);
    
    // Add timeout wrapper to prevent deadlock
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000);
    });
    
    const queryPromise = supabase
      .from('staff_availability')
      .select('*')
      .eq('staff_id', staffId);
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      console.error(`Error fetching staff availability for ${staffId}:`, error);
      throw error;
    }
    
    // If no data is found, return empty array
    if (!data || data.length === 0) {
      console.log(`No availability data found for staff ${staffId}`);
      return [];
    }
    
    console.log(`Found ${data.length} availability records for staff ${staffId}`);
    
    // Map the database records to our WeeklyAvailability model
    return data.map(item => {
      // Parse time_slot format which might be "09:00-12:00" to get start and end times
      const [startTime, endTime] = item.time_slot.split('-');
      
      return {
        staffId: item.staff_id,
        dayOfWeek: item.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: startTime,
        endTime: endTime,
        isAvailable: item.is_available,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch availability for staff ${staffId}:`, err);
    // This is where errors from both the ping and the data fetch will be caught
    // Rethrow with a more specific message
    if (err instanceof Error && err.message.includes('connection')) {
      throw err; // Already formatted connection error
    } else {
      throw new Error(`Failed to fetch availability data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
};

/**
 * Convert weekly availability to monthly capacity hours
 * Accounts for different month lengths and calculates total available hours for a given month
 * 
 * @param weeklyAvailability Array of weekly availability records
 * @param monthStart Start date of the month
 * @param monthEnd End date of the month
 * @returns Promise resolving to total monthly capacity hours
 */
export const convertWeeklyToMonthlyCapacity = async (
  weeklyAvailability: WeeklyAvailability[],
  monthStart: Date,
  monthEnd: Date
): Promise<number> => {
  try {
    console.log(`Converting weekly availability to monthly capacity for period ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);
    
    if (!weeklyAvailability || weeklyAvailability.length === 0) {
      // Default capacity: 40 hours/week (173.33 hours/month average)
      console.log('No availability data found, using default capacity of 173.33 hours/month');
      return 173.33;
    }

    // Calculate weekly capacity from availability records
    let weeklyCapacityHours = 0;
    
    // Group availability by day of week
    const availabilityByDay = weeklyAvailability.reduce<Record<number, WeeklyAvailability[]>>(
      (acc, avail) => {
        if (avail.isAvailable) {
          if (!acc[avail.dayOfWeek]) {
            acc[avail.dayOfWeek] = [];
          }
          acc[avail.dayOfWeek].push(avail);
        }
        return acc;
      },
      {}
    );

    // Calculate hours for each day
    for (const [dayOfWeek, dayAvailabilities] of Object.entries(availabilityByDay)) {
      let dailyHours = 0;
      
      for (const avail of dayAvailabilities) {
        // Parse time strings (e.g., "09:00" to hours)
        const startParts = avail.startTime.split(':').map(Number);
        const endParts = avail.endTime.split(':').map(Number);
        
        const startHours = startParts[0] + (startParts[1] || 0) / 60;
        const endHours = endParts[0] + (endParts[1] || 0) / 60;
        
        const slotHours = endHours - startHours;
        dailyHours += slotHours;
      }
      
      weeklyCapacityHours += dailyHours;
    }

    console.log(`Calculated weekly capacity: ${weeklyCapacityHours} hours`);

    // Calculate number of weeks in the month period
    const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
    const monthDurationMs = monthEnd.getTime() - monthStart.getTime();
    const weeksInMonth = monthDurationMs / millisecondsPerWeek;

    // Calculate monthly capacity
    const monthlyCapacity = weeklyCapacityHours * weeksInMonth;

    console.log(`Monthly capacity calculated: ${monthlyCapacity} hours (${weeksInMonth} weeks)`);
    return monthlyCapacity;
  } catch (error) {
    console.error('Error converting weekly to monthly capacity:', error);
    // Return default capacity on error
    return 173.33;
  }
};

/**
 * Update weekly availability for a specific day
 * @param staffId The UUID of the staff member
 * @param dayOfWeek The day of the week (0-6)
 * @param availabilities Array of availability records to set
 * @returns Promise resolving to the updated availability records
 */
export const updateWeeklyAvailability = async (
  staffId: string,
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  availabilities: Omit<WeeklyAvailability, "staffId" | "dayOfWeek">[]
): Promise<WeeklyAvailability[]> => {
  // First, get existing availabilities for this staff and day
  const { data: existingData, error: fetchError } = await supabase
    .from('staff_availability')
    .select('id')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek);
  
  if (fetchError) {
    console.error("Error fetching existing staff availability:", fetchError);
    throw fetchError;
  }
  
  // Delete existing records for this staff and day
  if (existingData && existingData.length > 0) {
    const { error: deleteError } = await supabase
      .from('staff_availability')
      .delete()
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek);
    
    if (deleteError) {
      console.error("Error deleting existing staff availability:", deleteError);
      throw deleteError;
    }
  }
  
  // Prepare records for insertion
  const recordsToInsert = availabilities.map(avail => ({
    staff_id: staffId,
    day_of_week: dayOfWeek,
    time_slot: `${avail.startTime}-${avail.endTime}`,
    is_available: avail.isAvailable,
  }));
  
  // Insert new availability records
  const { data: insertedData, error: insertError } = await supabase
    .from('staff_availability')
    .insert(recordsToInsert)
    .select();
  
  if (insertError) {
    console.error("Error inserting staff availability:", insertError);
    throw insertError;
  }
  
  // Return the newly created availability records
  return insertedData.map(item => ({
    staffId: item.staff_id,
    dayOfWeek: item.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    startTime: item.time_slot.split('-')[0],
    endTime: item.time_slot.split('-')[1],
    isAvailable: item.is_available,
  }));
};

/**
 * Batch update weekly availability for multiple days
 * @param staffId The UUID of the staff member
 * @param availabilities Array of availability records to set
 * @returns Promise resolving to the updated availability records
 */
export const batchUpdateWeeklyAvailability = async (
  staffId: string,
  availabilities: WeeklyAvailability[]
): Promise<WeeklyAvailability[]> => {
  try {
    // Group availabilities by day of week
    const availabilitiesByDay = availabilities.reduce<Record<string, Omit<WeeklyAvailability, "staffId" | "dayOfWeek">[]>>(
      (acc, avail) => {
        const day = avail.dayOfWeek.toString();
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push({
          startTime: avail.startTime,
          endTime: avail.endTime,
          isAvailable: avail.isAvailable,
        });
        return acc;
      },
      {}
    );
    
    // Update each day's availabilities
    const results: WeeklyAvailability[] = [];
    for (const [day, dayAvailabilities] of Object.entries(availabilitiesByDay)) {
      const dayOfWeek = parseInt(day) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const updatedAvailabilities = await updateWeeklyAvailability(
        staffId,
        dayOfWeek,
        dayAvailabilities
      );
      results.push(...updatedAvailabilities);
    }
    
    return results;
  } catch (err) {
    console.error(`Failed to batch update availability for staff ${staffId}:`, err);
    throw new Error(`Failed to update availability data: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

/**
 * Calculate availability summary statistics
 * @param staffId The UUID of the staff member
 * @returns Promise resolving to availability summary statistics
 */
export const calculateAvailabilitySummary = async (
  staffId: string
): Promise<AvailabilitySummary> => {
  try {
    const availabilities = await getWeeklyAvailabilityByStaff(staffId);
    
    // Calculate hours for each time slot and group by day
    const dailySummaries = Array.from({ length: 7 }, (_, i) => ({ 
      day: i, 
      totalHours: 0,
      slots: [] as { startTime: string; endTime: string }[] 
    }));
    
    // Distribution by time of day
    const distribution: { [key: string]: number } = {
      morning: 0,   // 6:00 AM - 12:00 PM
      afternoon: 0, // 12:00 PM - 5:00 PM
      evening: 0    // 5:00 PM - 10:00 PM
    };
    
    for (const avail of availabilities) {
      if (avail.isAvailable) {
        // Calculate hours in this time slot
        const startParts = avail.startTime.split(':').map(Number);
        const endParts = avail.endTime.split(':').map(Number);
        
        const startHours = startParts[0] + startParts[1] / 60;
        const endHours = endParts[0] + endParts[1] / 60;
        
        const hours = endHours - startHours;
        dailySummaries[avail.dayOfWeek].totalHours += hours;
        
        // Track detailed slot information
        dailySummaries[avail.dayOfWeek].slots.push({
          startTime: avail.startTime,
          endTime: avail.endTime
        });
        
        // Calculate distribution by time of day
        // This is a simplified algorithm - in reality we'd need to split slots that cross boundaries
        if (startHours >= 6 && startHours < 12) {
          distribution.morning += hours;
        } else if (startHours >= 12 && startHours < 17) {
          distribution.afternoon += hours;
        } else if (startHours >= 17 && startHours < 22) {
          distribution.evening += hours;
        }
      }
    }
    
    // Calculate weekly total
    const weeklyTotal = dailySummaries.reduce((sum, day) => sum + day.totalHours, 0);
    
    // Calculate average daily hours (only counting days with any availability)
    const daysWithAvailability = dailySummaries.filter(day => day.totalHours > 0).length;
    const averageDailyHours = daysWithAvailability > 0 
      ? weeklyTotal / daysWithAvailability 
      : 0;
    
    // Find peak day (day with most hours)
    let peakDay: number | undefined = undefined;
    let maxHours = 0;
    
    dailySummaries.forEach(day => {
      if (day.totalHours > maxHours) {
        maxHours = day.totalHours;
        peakDay = day.day;
      }
    });
    
    return {
      dailySummaries,
      weeklyTotal,
      averageDailyHours,
      peakDay
    };
  } catch (err) {
    console.error(`Failed to calculate availability summary for staff ${staffId}:`, err);
    // If the error is a connection issue, return an empty summary so the
    // UI can display partial data instead of crashing.
    if (err instanceof Error && (err.message.includes('connection') || err.message.includes('network') || err.message.includes('Failed to fetch'))) {
      const emptySummary: AvailabilitySummary = {
        dailySummaries: Array.from({ length: 7 }, (_, i) => ({ day: i, totalHours: 0, slots: [] })),
        weeklyTotal: 0,
        averageDailyHours: 0,
      };
      return emptySummary;
    }
    throw new Error(`Failed to calculate availability summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};
