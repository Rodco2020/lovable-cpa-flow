
import eventService from "@/services/eventService";

/**
 * Represents an availability mask for a specific day
 */
export interface AvailabilityMask {
  date: string;
  staffId: string;
  slots: {
    hour: number;
    minute: number;
    isAvailable: boolean;
  }[];
}

/**
 * Initialize integrations between the Scheduler module and other modules
 */
export function initializeSchedulerIntegrations() {
  // Listen for staff availability updates to refresh scheduling constraints
  eventService.subscribe("availability.updated", (event) => {
    // Extract staff ID from the event payload if available
    const staffId = event.payload && typeof event.payload === 'object' && 'staffId' in event.payload 
      ? event.payload.staffId 
      : null;
    
    console.log(`[Scheduler Integration] Refreshing scheduling constraints for staff: ${staffId || 'all staff'}`);
    
    // Additional logic to update scheduler constraints would go here
  });
  
  // Listen for task completion events to refresh task lists
  eventService.subscribe("task.completed", (event) => {
    console.log("[Scheduler Integration] Task completed, refreshing task lists");
    
    // Additional logic to update task lists would go here
  });
  
  console.log("[Scheduler Integration] Initialized");
}

/**
 * Generate availability masks for a staff member for a given date range
 * This is a placeholder implementation that would typically fetch from a service
 */
export async function generateAvailabilityMasks(staffId: string, startDate: Date, days: number): Promise<AvailabilityMask[]> {
  const masks: AvailabilityMask[] = [];
  
  // Create a simple placeholder mask for demo purposes
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const mask: AvailabilityMask = {
      date: date.toISOString().split('T')[0],
      staffId,
      slots: []
    };
    
    // Generate 30-minute slots from 8:00 to 17:00
    for (let hour = 8; hour < 17; hour++) {
      for (let minute of [0, 30]) {
        mask.slots.push({
          hour,
          minute,
          isAvailable: true // Default all slots to available
        });
      }
    }
    
    masks.push(mask);
  }
  
  return masks;
}
