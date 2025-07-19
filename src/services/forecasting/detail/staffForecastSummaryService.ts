
import { StaffUtilizationData, MonthlyStaffMetrics, DemandDataPoint, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { StaffBasedAggregationService } from '../demand/staffBasedAggregationService';
import { getWeeklyAvailabilityByStaff, convertWeeklyToMonthlyCapacity } from '@/services/staff/availabilityService';
import { debugLog } from '../logger';

/**
 * Staff Forecast Summary Service
 * 
 * Calculates staff utilization metrics including demand, capacity, and gaps.
 * Works alongside StaffBasedAggregationService to provide detailed staff-level forecasting.
 */
export class StaffForecastSummaryService {
  
  /**
   * Calculate staff utilization data for all staff members across forecast periods
   */
  static async calculateStaffUtilization(
    forecastPeriods: ForecastData[],
    allTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData[]> {
    debugLog(`🚀 [STAFF FORECAST SUMMARY] Calculating staff utilization for ${forecastPeriods.length} periods`);

    // Get unique staff IDs from tasks with preferred staff assignments
    const assignedStaffIds = [...new Set(
      allTasks
        .filter(task => task.preferred_staff_id)
        .map(task => task.preferred_staff_id!)
    )];

    debugLog(`🔍 [STAFF FORECAST SUMMARY] Found ${assignedStaffIds.length} staff members with assigned tasks`);

    // Resolve staff member information
    const staffMembers = await StaffBasedAggregationService.resolveStaffMembers(assignedStaffIds);
    
    // Generate staff-specific data points using existing service
    const staffDataPoints = await StaffBasedAggregationService.generateStaffSpecificDataPoints(
      forecastPeriods,
      allTasks,
      staffMembers
    );

    // Calculate utilization for each staff member
    const utilizationData: StaffUtilizationData[] = [];

    for (const staffMember of staffMembers) {
      const staffUtilization = await this.calculateIndividualStaffUtilization(
        staffMember,
        staffDataPoints,
        months,
        forecastPeriods
      );
      
      if (staffUtilization) {
        utilizationData.push(staffUtilization);
      }
    }

    // Add "Unassigned" category for tasks without preferred staff
    const unassignedUtilization = this.calculateUnassignedTasksUtilization(
      allTasks,
      forecastPeriods,
      months
    );
    
    if (unassignedUtilization) {
      utilizationData.push(unassignedUtilization);
    }

    debugLog(`✅ [STAFF FORECAST SUMMARY] Calculated utilization for ${utilizationData.length} staff/categories`);
    return utilizationData;
  }

  /**
   * Calculate utilization metrics for an individual staff member
   */
  private static async calculateIndividualStaffUtilization(
    staffMember: { id: string; name: string },
    staffDataPoints: DemandDataPoint[],
    months: MonthInfo[],
    forecastPeriods: ForecastData[]
  ): Promise<StaffUtilizationData | null> {
    try {
      debugLog(`🔧 [STAFF FORECAST SUMMARY] Calculating utilization for ${staffMember.name} (${staffMember.id})`);

      // Filter data points for this staff member
      const staffSpecificDataPoints = staffDataPoints.filter(
        point => point.actualStaffId === staffMember.id
      );

      if (staffSpecificDataPoints.length === 0) {
        debugLog(`⚠️ [STAFF FORECAST SUMMARY] No data points found for staff ${staffMember.name}`);
        return null;
      }

      // Calculate monthly metrics
      const monthlyData = new Map<string, MonthlyStaffMetrics>();
      let totalDemandHours = 0;
      let totalCapacityHours = 0;

      for (const month of months) {
        const monthDataPoint = staffSpecificDataPoints.find(
          point => point.month === month.key
        );

        const demandHours = monthDataPoint?.demandHours || 0;
        
        // Get capacity for this month
        const capacityHours = await this.getStaffCapacityForMonth(
          staffMember.id,
          month
        );

        const gap = capacityHours - demandHours;
        const utilizationPercentage = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;

        monthlyData.set(month.key, {
          demandHours,
          capacityHours,
          gap,
          utilizationPercentage
        });

        totalDemandHours += demandHours;
        totalCapacityHours += capacityHours;
      }

      const overallUtilization = totalCapacityHours > 0 ? (totalDemandHours / totalCapacityHours) * 100 : 0;

      // TODO: Calculate revenue metrics (placeholder for now)
      const utilizationData: StaffUtilizationData = {
        staffId: staffMember.id,
        staffName: staffMember.name,
        monthlyData,
        totalHours: totalDemandHours,
        totalCapacity: totalCapacityHours,
        utilizationPercentage: overallUtilization,
        totalExpectedRevenue: 0, // TODO: Implement revenue calculation
        expectedHourlyRate: 0, // TODO: Implement rate calculation
        totalSuggestedRevenue: 0, // TODO: Implement suggested revenue
        expectedLessSuggested: 0 // TODO: Implement difference calculation
      };

      debugLog(`✅ [STAFF FORECAST SUMMARY] Calculated utilization for ${staffMember.name}:`, {
        totalDemandHours,
        totalCapacityHours,
        utilizationPercentage: overallUtilization
      });

      return utilizationData;
    } catch (error) {
      console.error(`❌ [STAFF FORECAST SUMMARY] Error calculating utilization for ${staffMember.name}:`, error);
      return null;
    }
  }

  /**
   * Calculate utilization for unassigned tasks
   */
  private static calculateUnassignedTasksUtilization(
    allTasks: RecurringTaskDB[],
    forecastPeriods: ForecastData[],
    months: MonthInfo[]
  ): StaffUtilizationData | null {
    debugLog(`🔧 [STAFF FORECAST SUMMARY] Calculating unassigned tasks utilization`);

    // Filter tasks without preferred staff
    const unassignedTasks = allTasks.filter(task => !task.preferred_staff_id);

    if (unassignedTasks.length === 0) {
      debugLog(`ℹ️ [STAFF FORECAST SUMMARY] No unassigned tasks found`);
      return null;
    }

    // Calculate monthly metrics for unassigned tasks
    const monthlyData = new Map<string, MonthlyStaffMetrics>();
    let totalDemandHours = 0;

    for (const month of months) {
      // TODO: Implement proper monthly demand calculation for unassigned tasks
      // This is a simplified calculation - should use the same logic as staff-specific calculations
      const demandHours = 0; // Placeholder

      monthlyData.set(month.key, {
        demandHours,
        capacityHours: 0, // Unassigned tasks don't have capacity
        gap: -demandHours, // Negative gap indicates unmet demand
        utilizationPercentage: 0
      });

      totalDemandHours += demandHours;
    }

    const unassignedUtilization: StaffUtilizationData = {
      staffId: 'unassigned',
      staffName: 'Unassigned',
      monthlyData,
      totalHours: totalDemandHours,
      totalCapacity: 0,
      utilizationPercentage: 0,
      totalExpectedRevenue: 0,
      expectedHourlyRate: 0,
      totalSuggestedRevenue: 0,
      expectedLessSuggested: 0
    };

    debugLog(`✅ [STAFF FORECAST SUMMARY] Calculated unassigned utilization:`, {
      unassignedTasks: unassignedTasks.length,
      totalDemandHours
    });

    return unassignedUtilization;
  }

  /**
   * Get staff capacity for a specific month
   */
  private static async getStaffCapacityForMonth(
    staffId: string,
    month: MonthInfo
  ): Promise<number> {
    try {
      // Get staff availability
      const availability = await getWeeklyAvailabilityByStaff(staffId);
      
      if (availability.length === 0) {
        // Use default capacity: 40 hours/week (173.33 hours/month)
        debugLog(`📅 [STAFF FORECAST SUMMARY] Using default capacity for staff ${staffId}: 173.33 hours/month`);
        return 173.33;
      }

      // Convert weekly availability to monthly capacity
      const monthlyCapacity = await convertWeeklyToMonthlyCapacity(
        availability,
        month.startDate || new Date(),
        month.endDate || new Date()
      );

      debugLog(`📅 [STAFF FORECAST SUMMARY] Calculated capacity for staff ${staffId}: ${monthlyCapacity} hours`);
      return monthlyCapacity;
    } catch (error) {
      console.error(`❌ [STAFF FORECAST SUMMARY] Error getting capacity for staff ${staffId}:`, error);
      // Return default capacity on error
      return 173.33;
    }
  }

  /**
   * Calculate firm-wide totals across all staff
   */
  static calculateFirmWideTotals(utilizationData: StaffUtilizationData[]): {
    totalDemand: number;
    totalCapacity: number;
    overallUtilization: number;
    totalRevenue: number;
    totalGap: number;
  } {
    const totals = utilizationData.reduce(
      (acc, staff) => {
        acc.totalDemand += staff.totalHours;
        acc.totalCapacity += staff.totalCapacity;
        acc.totalRevenue += staff.totalExpectedRevenue;
        return acc;
      },
      {
        totalDemand: 0,
        totalCapacity: 0,
        totalRevenue: 0
      }
    );

    const overallUtilization = totals.totalCapacity > 0 ? (totals.totalDemand / totals.totalCapacity) * 100 : 0;
    const totalGap = totals.totalCapacity - totals.totalDemand;

    debugLog(`📊 [STAFF FORECAST SUMMARY] Firm-wide totals calculated:`, {
      totalDemand: totals.totalDemand,
      totalCapacity: totals.totalCapacity,
      overallUtilization,
      totalGap
    });

    return {
      ...totals,
      overallUtilization,
      totalGap
    };
  }
}
