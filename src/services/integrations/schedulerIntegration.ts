
import eventService from "@/services/eventService";

/**
 * Represents an availability mask for a specific day
 */
export interface AvailabilityMask {
  date: string;
  staffId: string;
  availableSlots: {
    startTime: string;
    endTime: string;
  }[];
  slots: {
    hour: number;
    minute: number;
    isAvailable: boolean;
  }[];
}

/**
 * Initialize scheduler integrations
 */
export const initializeSchedulerIntegrations = () => {
  // Listen for staff availability updates to refresh scheduling constraints
  eventService.subscribe("availability.updated", (event) => {
    // Extract staff ID from the event payload if available
    const staffId = event.payload && typeof event.payload === 'object' && 'staffId' in event.payload 
      ? event.payload.staffId 
      : null;
    
    console.log(`[Scheduler Integration] Refreshing scheduling constraints for staff: ${staffId || 'all staff'}`);
  });
  
  // Listen for task completion events to refresh task lists
  eventService.subscribe("task.completed", (event) => {
    console.log("[Scheduler Integration] Task completed, refreshing task lists");
  });
  
  console.log("[Scheduler Integration] Initialized");
};

/**
 * Generate availability masks for a staff member for a given date range
 */
export async function generateAvailabilityMasks(staffId: string, startDate: Date, days: number): Promise<AvailabilityMask[]> {
  const masks: AvailabilityMask[] = [];
  
  // Create availability masks for the specified date range
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const mask: AvailabilityMask = {
      date: date.toISOString().split('T')[0],
      staffId,
      slots: [],
      availableSlots: []
    };
    
    // Generate 30-minute slots from 8:00 to 17:00
    for (let hour = 8; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        mask.slots.push({
          hour,
          minute,
          isAvailable: true // Default all slots to available
        });
        
        // Also add to availableSlots for StaffScheduleCard
        const startTime = `${hour < 10 ? '0' + hour : hour}:${minute === 0 ? '00' : minute}`;
        const endHour = minute === 0 ? hour : hour + 1;
        const endMinute = minute === 0 ? 30 : 0;
        const endTime = `${endHour < 10 ? '0' + endHour : endHour}:${endMinute === 0 ? '00' : endMinute}`;
        
        mask.availableSlots.push({
          startTime,
          endTime
        });
      }
    }
    
    masks.push(mask);
  }
  
  return masks;
}

/**
 * Integration service for scheduler functionality
 */
export class SchedulerIntegrationService {
  /**
   * Initialize scheduler integrations
   */
  static initialize() {
    initializeSchedulerIntegrations();
  }
}

export default SchedulerIntegrationService;
