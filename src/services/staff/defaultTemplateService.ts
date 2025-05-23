
import { WeeklyAvailability } from "@/types/staff";
import { getWeeklyAvailabilityByStaff, batchUpdateWeeklyAvailability } from "./availabilityService";
import { getStaffById } from "./staffService";
import { mapStaffSkillsToForecastSkills } from "./skillMappingService";

/**
 * Functions for handling staff default templates and templates setup
 */

/**
 * Ensure a staff member has an availability template
 * Creates a default template if none exists
 * @param staffId The UUID of the staff member
 * @returns Promise resolving to the availability records
 */
export const ensureStaffHasAvailability = async (staffId: string) => {
  // First, check if staff member already has availability templates
  const existingAvailability = await getWeeklyAvailabilityByStaff(staffId);
  
  // If availability exists, return it
  if (existingAvailability && existingAvailability.length > 0) {
    console.log(`Staff ${staffId} already has ${existingAvailability.length} availability entries`);
    return existingAvailability;
  }
  
  console.log(`Creating default availability template for staff ${staffId}`);
  
  // Create default availability for weekdays (9am-5pm, Monday-Friday)
  const defaultAvailability: WeeklyAvailability[] = [];
  
  // For each weekday (1-5 = Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    defaultAvailability.push({
      staffId,
      dayOfWeek: day as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true
    });
  }
  
  // Save the default availability to the database
  try {
    const result = await batchUpdateWeeklyAvailability(staffId, defaultAvailability);
    console.log(`Created ${result.length} default availability entries for staff ${staffId}`);
    return result;
  } catch (error) {
    console.error(`Failed to create default availability for staff ${staffId}:`, error);
    
    // Return the default availability even if saving failed
    // This ensures capacity calculation can proceed
    return defaultAvailability;
  }
};
