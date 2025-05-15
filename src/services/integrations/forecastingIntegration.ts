
import eventService from "@/services/eventService";
import { AvailabilitySummary } from "@/types/staff";
import { DateRange, ForecastMode, ForecastParameters, SkillType } from "@/types/forecasting";
import { calculateAvailabilitySummary } from "@/services/staffService";
import { getAllStaff } from "@/services/staffService";

// Types for capacity calculations
export interface CapacityData {
  staffId: string;
  name: string;
  skills: SkillType[];
  dailyCapacity: Record<number, number>; // day of week -> hours
  weeklyTotal: number;
}

/**
 * Calculate virtual capacity based on staff availability templates
 */
export const calculateVirtualCapacity = async (
  dateRange: DateRange,
  includeSkills: SkillType[] | "all" = "all"
): Promise<Record<string, CapacityData>> => {
  try {
    // Get all active staff
    const allStaff = await getAllStaff();
    const activeStaff = allStaff.filter(staff => staff.status === "active");
    
    // Initialize capacity data structure
    const capacityMap: Record<string, CapacityData> = {};
    
    // Process each staff member's availability
    for (const staff of activeStaff) {
      // Skip staff without relevant skills if filtering
      if (includeSkills !== "all" && !staff.skills.some(skill => includeSkills.includes(skill as SkillType))) {
        continue;
      }
      
      // Get availability summary for this staff
      const availSummary = await calculateAvailabilitySummary(staff.id);
      
      // Initialize staff capacity data
      capacityMap[staff.id] = {
        staffId: staff.id,
        name: staff.fullName,
        skills: staff.skills as SkillType[],
        dailyCapacity: {},
        weeklyTotal: availSummary.weeklyTotal
      };
      
      // Map day summary to daily capacity
      availSummary.dailySummaries.forEach(daySummary => {
        capacityMap[staff.id].dailyCapacity[daySummary.day] = daySummary.totalHours;
      });
    }
    
    return capacityMap;
  } catch (error) {
    console.error("Error calculating virtual capacity:", error);
    throw error;
  }
};

/**
 * Trigger forecast recalculation when availability changes
 */
export const setupAvailabilityForecastIntegration = () => {
  // Listen for availability changes
  eventService.subscribe("availability.updated", async (event) => {
    const { staffId } = event.payload;
    
    // Trigger forecast recalculation
    eventService.publish({
      type: "forecast.recalculated",
      payload: {
        trigger: "availability.updated",
        affectedStaffIds: [staffId],
        mode: "virtual" as ForecastMode,
      },
      source: "forecastingIntegration"
    });
    
    console.log(`Triggered forecast recalculation due to availability change for staff ${staffId}`);
  });
  
  // Listen for availability template changes
  eventService.subscribe("availability.template.changed", async (event) => {
    const { staffId, changeType } = event.payload;
    
    // Trigger forecast recalculation
    eventService.publish({
      type: "forecast.recalculated",
      payload: {
        trigger: "availability.template.changed",
        affectedStaffIds: [staffId],
        changeType,
        mode: "virtual" as ForecastMode,
      },
      source: "forecastingIntegration"
    });
    
    console.log(`Triggered forecast recalculation due to availability template change for staff ${staffId}`);
  });
};

// Export helper to initialize all integrations
export const initializeForecastingIntegrations = () => {
  setupAvailabilityForecastIntegration();
  console.log("Forecasting integrations initialized");
};

export default {
  calculateVirtualCapacity,
  initializeForecastingIntegrations
};
