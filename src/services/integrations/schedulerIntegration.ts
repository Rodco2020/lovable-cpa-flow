import eventService from "@/services/eventService";

/**
 * Initialize integrations between the Scheduler module and other modules
 */
export function initializeSchedulerIntegrations() {
  // Listen for staff availability updates to refresh scheduling constraints
  eventService.subscribe("availability.updated", (event) => {
    // Extract staff ID from the event payload if available
    const staffId = event.payload && 'staffId' in event.payload ? event.payload.staffId : null;
    
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
