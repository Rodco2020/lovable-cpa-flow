
import { StaffUtilizationData, MonthlyStaffMetrics, DemandDataPoint, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { StaffBasedAggregationService } from '../demand/staffBasedAggregationService';
import { getWeeklyAvailabilityByStaff, convertWeeklyToMonthlyCapacity } from '@/services/staff/availabilityService';
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '../logger';

/**
 * Staff Forecast Summary Service
 * 
 * Calculates staff utilization metrics including demand, capacity, and gaps.
 * Works alongside StaffBasedAggregationService to provide detailed staff-level forecasting.
 */
export class StaffForecastSummaryService {
  
  /**
   * Aggregate tasks by staff member for easier processing
   */
  static aggregateTasksByStaff(allTasks: RecurringTaskDB[]): Map<string, RecurringTaskDB[]> {
    const tasksByStaff = new Map<string, RecurringTaskDB[]>();
    
    for (const task of allTasks) {
      const staffId = task.preferred_staff_id || 'unassigned';
      
      if (!tasksByStaff.has(staffId)) {
        tasksByStaff.set(staffId, []);
      }
      
      tasksByStaff.get(staffId)!.push(task);
    }
    
    debugLog(`📋 [STAFF FORECAST SUMMARY] Aggregated tasks for ${tasksByStaff.size} staff/categories`);
    return tasksByStaff;
  }

  /**
   * Calculate monthly demand hours for a specific staff member
   */
  static calculateMonthlyDemand(
    staffTasks: RecurringTaskDB[],
    forecastPeriods: ForecastData[],
    months: MonthInfo[]
  ): Map<string, number> {
    const monthlyDemand = new Map<string, number>();
    
    for (const month of months) {
      let totalDemandHours = 0;
      
      for (const task of staffTasks) {
        // Calculate task demand based on recurrence pattern and estimated hours
        const taskDemand = this.calculateTaskDemandForMonth(task, month);
        totalDemandHours += taskDemand;
      }
      
      monthlyDemand.set(month.key, totalDemandHours);
    }
    
    return monthlyDemand;
  }

  /**
   * Calculate demand hours for a single task in a specific month
   */
  private static calculateTaskDemandForMonth(task: RecurringTaskDB, month: MonthInfo): number {
    if (!task.is_active) return 0;
    
    const estimatedHours = Number(task.estimated_hours) || 0;
    
    switch (task.recurrence_type) {
      case 'weekly':
        // Assume 4.33 weeks per month on average
        return estimatedHours * 4.33;
      case 'monthly':
        return estimatedHours;
      case 'quarterly':
        // Quarterly tasks occur every 3 months
        return estimatedHours / 3;
      case 'annually':
        // Annual tasks occur once per year (12 months)
        return estimatedHours / 12;
      case 'daily':
        // Daily tasks with weekday restrictions
        const workdaysPerMonth = 22; // Typical business days
        return estimatedHours * workdaysPerMonth;
      default:
        return estimatedHours;
    }
  }

  /**
   * Calculate financial metrics for a staff member
   */
  static async calculateStaffFinancials(
    staffId: string,
    totalDemandHours: number
  ): Promise<{
    expectedHourlyRate: number;
    totalSuggestedRevenue: number;
    totalExpectedRevenue: number;
    expectedLessSuggested: number;
  }> {
    try {
      // Get staff cost per hour from database
      const { data: staffData, error } = await supabase
        .from('staff')
        .select('cost_per_hour')
        .eq('id', staffId)
        .maybeSingle();

      if (error) {
        console.error(`❌ [STAFF FORECAST SUMMARY] Error fetching staff data for ${staffId}:`, error);
        return {
          expectedHourlyRate: 0,
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          expectedLessSuggested: 0
        };
      }

      const expectedHourlyRate = Number(staffData?.cost_per_hour) || 50; // Default rate
      const totalSuggestedRevenue = totalDemandHours * expectedHourlyRate;
      
      // For now, expected revenue equals suggested revenue
      // This could be extended to include client-specific rates
      const totalExpectedRevenue = totalSuggestedRevenue;
      const expectedLessSuggested = totalExpectedRevenue - totalSuggestedRevenue;

      debugLog(`💰 [STAFF FORECAST SUMMARY] Financial calculations for ${staffId}:`, {
        expectedHourlyRate,
        totalDemandHours,
        totalSuggestedRevenue,
        totalExpectedRevenue
      });

      return {
        expectedHourlyRate,
        totalSuggestedRevenue,
        totalExpectedRevenue,
        expectedLessSuggested
      };
    } catch (error) {
      console.error(`❌ [STAFF FORECAST SUMMARY] Error calculating financials for ${staffId}:`, error);
      return {
        expectedHourlyRate: 0,
        totalSuggestedRevenue: 0,
        totalExpectedRevenue: 0,
        expectedLessSuggested: 0
      };
    }
  }

  /**
   * Handle unassigned tasks and create utilization data
   */
  static handleUnassignedTasks(
    unassignedTasks: RecurringTaskDB[],
    forecastPeriods: ForecastData[],
    months: MonthInfo[]
  ): StaffUtilizationData {
    debugLog(`🔧 [STAFF FORECAST SUMMARY] Handling ${unassignedTasks.length} unassigned tasks`);

    const monthlyDemand = this.calculateMonthlyDemand(unassignedTasks, forecastPeriods, months);
    const monthlyData: Record<string, MonthlyStaffMetrics> = {};
    let totalDemandHours = 0;

    for (const month of months) {
      const demandHours = monthlyDemand.get(month.key) || 0;
      
      monthlyData[month.key] = {
        demandHours,
        capacityHours: 0, // Unassigned tasks don't have capacity
        gap: -demandHours, // Negative gap indicates unmet demand
        utilizationPercentage: 0
      };

      totalDemandHours += demandHours;
    }

    return {
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
  }

  /**
   * Calculate staff utilization data for all staff members across forecast periods
   */
  static async calculateStaffUtilization(
    forecastPeriods: ForecastData[],
    allTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData[]> {
    debugLog(`🚀 [STAFF FORECAST SUMMARY] Calculating staff utilization for ${forecastPeriods.length} periods`);

    // Aggregate tasks by staff
    const tasksByStaff = this.aggregateTasksByStaff(allTasks);
    const utilizationData: StaffUtilizationData[] = [];

    // Get unique staff IDs (excluding unassigned)
    const assignedStaffIds = [...tasksByStaff.keys()].filter(id => id !== 'unassigned');
    
    if (assignedStaffIds.length > 0) {
      // Resolve staff member information
      const staffMembers = await StaffBasedAggregationService.resolveStaffMembers(assignedStaffIds);
      
      // Calculate utilization for each staff member
      for (const staffMember of staffMembers) {
        const staffTasks = tasksByStaff.get(staffMember.id) || [];
        const staffUtilization = await this.calculateIndividualStaffUtilization(
          staffMember,
          staffTasks,
          months,
          forecastPeriods
        );
        
        if (staffUtilization) {
          utilizationData.push(staffUtilization);
        }
      }
    }

    // Handle unassigned tasks
    const unassignedTasks = tasksByStaff.get('unassigned') || [];
    if (unassignedTasks.length > 0) {
      const unassignedUtilization = this.handleUnassignedTasks(
        unassignedTasks,
        forecastPeriods,
        months
      );
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
    staffTasks: RecurringTaskDB[],
    months: MonthInfo[],
    forecastPeriods: ForecastData[]
  ): Promise<StaffUtilizationData | null> {
    try {
      debugLog(`🔧 [STAFF FORECAST SUMMARY] Calculating utilization for ${staffMember.name} (${staffMember.id})`);

      if (staffTasks.length === 0) {
        debugLog(`⚠️ [STAFF FORECAST SUMMARY] No tasks found for staff ${staffMember.name}`);
        return null;
      }

      // Calculate monthly demand for this staff member
      const monthlyDemand = this.calculateMonthlyDemand(staffTasks, forecastPeriods, months);
      
      // Calculate monthly metrics
      const monthlyData: Record<string, MonthlyStaffMetrics> = {};
      let totalDemandHours = 0;
      let totalCapacityHours = 0;

      for (const month of months) {
        const demandHours = monthlyDemand.get(month.key) || 0;
        
        // Get capacity for this month
        const capacityHours = await this.getStaffCapacityForMonth(
          staffMember.id,
          month
        );

        const gap = capacityHours - demandHours;
        const utilizationPercentage = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;

        monthlyData[month.key] = {
          demandHours,
          capacityHours,
          gap,
          utilizationPercentage
        };

        totalDemandHours += demandHours;
        totalCapacityHours += capacityHours;
      }

      const overallUtilization = totalCapacityHours > 0 ? (totalDemandHours / totalCapacityHours) * 100 : 0;

      // Calculate financial metrics
      const financials = await this.calculateStaffFinancials(staffMember.id, totalDemandHours);

      const utilizationData: StaffUtilizationData = {
        staffId: staffMember.id,
        staffName: staffMember.name,
        monthlyData,
        totalHours: totalDemandHours,
        totalCapacity: totalCapacityHours,
        utilizationPercentage: overallUtilization,
        totalExpectedRevenue: financials.totalExpectedRevenue,
        expectedHourlyRate: financials.expectedHourlyRate,
        totalSuggestedRevenue: financials.totalSuggestedRevenue,
        expectedLessSuggested: financials.expectedLessSuggested
      };

      debugLog(`✅ [STAFF FORECAST SUMMARY] Calculated utilization for ${staffMember.name}:`, {
        totalDemandHours,
        totalCapacityHours,
        utilizationPercentage: overallUtilization,
        totalSuggestedRevenue: financials.totalSuggestedRevenue
      });

      return utilizationData;
    } catch (error) {
      console.error(`❌ [STAFF FORECAST SUMMARY] Error calculating utilization for ${staffMember.name}:`, error);
      return null;
    }
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
