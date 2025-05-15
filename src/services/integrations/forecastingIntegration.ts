
import eventService from "@/services/eventService";
import { getForecast } from "@/services/forecastingService";

/**
 * Initialize integrations between the Forecasting module and other modules
 */
export function initializeForecastingIntegrations() {
  // Subscribe to staff availability updates
  eventService.subscribe("availability.updated", (event) => {
    // Extract staff ID from the event payload if available
    const staffId = event.payload && typeof event.payload === 'object' && 'staffId' in event.payload
      ? event.payload.staffId 
      : null;
    
    // Trigger forecast recalculation
    console.log(`[Forecasting Integration] Recalculating forecast due to availability update for staff: ${staffId || 'all staff'}`);
    
    // Emit forecast recalculation event
    eventService.publish({
      type: "forecast.recalculated",
      payload: {
        trigger: "availability.updated",
        staffId: staffId,
        timestamp: Date.now()
      },
      source: "forecasting-integration"
    });
  });
  
  // Subscribe to availability template changes
  eventService.subscribe("availability.template.changed", (event) => {
    // Extract staff ID and change type from the event payload if available
    const staffId = event.payload && typeof event.payload === 'object' && 'staffId' in event.payload
      ? event.payload.staffId 
      : null;
    const changeType = event.payload && typeof event.payload === 'object' && 'changeType' in event.payload
      ? event.payload.changeType 
      : 'unknown';
    
    console.log(`[Forecasting Integration] Template changed for staff: ${staffId || 'unknown'}, type: ${changeType}`);
    
    // Trigger forecast recalculation with a slight delay to allow for batched changes
    setTimeout(() => {
      eventService.publish({
        type: "forecast.recalculated",
        payload: {
          trigger: "availability.template.changed",
          staffId: staffId,
          changeType: changeType,
          timestamp: Date.now()
        },
        source: "forecasting-integration"
      });
    }, 300);
  });
  
  console.log("[Forecasting Integration] Initialized");
}
