
import eventService from "@/services/eventService";
import { getWeeklyAvailabilityByStaff } from "@/services/staffService";
import { WeeklyAvailability } from "@/types/staff";
import { format, addDays } from "date-fns";

// Type for availability mask
export interface AvailabilityMask {
  staffId: string;
  date: string; // ISO date string
  availableSlots: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  }[];
}

/**
 * Generate availability masks for scheduling based on weekly templates
 */
export const generateAvailabilityMasks = async (
  staffId: string,
  startDate: Date,
  numberOfDays: number = 7
): Promise<AvailabilityMask[]> => {
  try {
    // Get the staff member's weekly availability template
    const weeklyAvailability = await getWeeklyAvailabilityByStaff(staffId);
    
    if (!weeklyAvailability || weeklyAvailability.length === 0) {
      return [];
    }
    
    const masks: AvailabilityMask[] = [];
    
    // Generate mask for each day in the range
    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = addDays(startDate, i);
      const dayOfWeek = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      const dateString = format(currentDate, "yyyy-MM-dd");
      
      // Find availability slots for this day of week
      const daySlots = weeklyAvailability.filter(
        slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable
      );
      
      // Create mask for this day
      masks.push({
        staffId,
        date: dateString,
        availableSlots: daySlots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      });
    }
    
    return masks;
  } catch (error) {
    console.error("Error generating availability masks:", error);
    throw error;
  }
};

/**
 * Check if a time slot is available based on weekly template
 */
export const isTimeSlotAvailable = (
  weeklyAvailability: WeeklyAvailability[],
  date: Date,
  startTime: string,
  endTime: string
): boolean => {
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  
  // Get available time blocks for this day
  const daySlots = weeklyAvailability.filter(
    slot => slot.dayOfWeek === dayOfWeek && slot.isAvailable
  );
  
  // Check if the requested time falls within any available block
  return daySlots.some(slot => {
    // Time comparisons (simple string comparison works for HH:MM format)
    return slot.startTime <= startTime && slot.endTime >= endTime;
  });
};

/**
 * Setup integration between availability changes and scheduler
 */
export const setupAvailabilitySchedulerIntegration = () => {
  // Listen for availability template changes
  eventService.subscribe("availability.template.changed", (event) => {
    const { staffId } = event.payload;
    
    // Notify scheduler about availability changes
    console.log(`Scheduler notified about availability template change for staff ${staffId}`);
  });
};

// Export helper to initialize all integrations
export const initializeSchedulerIntegrations = () => {
  setupAvailabilitySchedulerIntegration();
  console.log("Scheduler integrations initialized");
};

export default {
  generateAvailabilityMasks,
  isTimeSlotAvailable,
  initializeSchedulerIntegrations
};
