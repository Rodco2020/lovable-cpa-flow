import { supabase } from '@/lib/supabase';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { EnhancedAvailabilityService } from '@/services/availability/enhancedAvailabilityService';
import { PeriodProcessingService } from '../demand/matrixTransformer/periodProcessingService';
import { MonthlyDemandCalculationService } from '../demand/matrixTransformer/monthlyDemandCalculationService';
import { staffQueries } from '@/utils/staffQueries';

/**
 * Staff Forecast Summary Service
 * 
 * Handles calculation of staff utilization data for forecast summary views
 * FIXED: Now uses proper recurrence-aware demand calculations matching Detail Matrix
 */
export class StaffForecastSummaryService {
  private static enhancedAvailabilityService = new EnhancedAvailabilityService();

  /**
   * Calculate staff utilization across forecast periods
   */
  static async calculateStaffUtilization(
    forecastPeriods: ForecastData[],
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData[]> {
    console.log('🚀 [STAFF FORECAST SUMMARY] Starting staff utilization calculation:', {
      periodsCount: forecastPeriods.length,
      tasksCount: recurringTasks.length,
      monthsCount: months.length
    });

    try {
      // FIXED: Use centralized staff query utility instead of direct Supabase call
      const staffMembers = await staffQueries.getActiveStaff();

      if (!staffMembers || staffMembers.length === 0) {
        console.warn('No active staff members found');
        return [];
      }

      console.log(`📊 [STAFF FORECAST SUMMARY] Processing ${staffMembers.length} staff members`);

      // Calculate utilization for each staff member
      const utilizationPromises = staffMembers.map(staff => 
        this.calculateStaffMemberUtilization(staff, recurringTasks, months)
      );

      const staffUtilization = await Promise.all(utilizationPromises);

      // Handle unassigned tasks
      const unassignedUtilization = this.calculateUnassignedTasksUtilization(recurringTasks, months);
      
      const allUtilization = [...staffUtilization, unassignedUtilization].filter(Boolean);

      console.log('✅ [STAFF FORECAST SUMMARY] Staff utilization calculation complete:', {
        totalStaff: allUtilization.length,
        assignedStaff: staffUtilization.filter(Boolean).length,
        hasUnassigned: !!unassignedUtilization
      });

      return allUtilization;

    } catch (error) {
      console.error('❌ [STAFF FORECAST SUMMARY] Error calculating staff utilization:', error);
      throw error;
    }
  }

  /**
   * Calculate utilization for a single staff member
   */
  private static async calculateStaffMemberUtilization(
    staff: any,
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData | null> {
    try {
      // Get tasks assigned to this staff member
      const assignedTasks = recurringTasks.filter(task => 
        task.preferred_staff_id === staff.id
      );

      if (assignedTasks.length === 0) {
        console.log(`📝 [STAFF FORECAST SUMMARY] No tasks assigned to ${staff.full_name}`);
        return null;
      }

      console.log(`📝 [STAFF FORECAST SUMMARY] Processing ${assignedTasks.length} tasks for ${staff.full_name}`);

      // Calculate monthly data
      const monthlyData: Record<string, any> = {};
      let totalHours = 0;
      let totalCapacityHours = 0;

      for (const month of months) {
        const monthlyCapacity = await this.getStaffCapacityForMonth(staff.id, month);
        const monthlyDemand = this.calculateMonthlyDemand(assignedTasks, month);

        // Add logging for verification
        console.log(`Staff ${staff.full_name} - Month ${month.key}: ${monthlyDemand} hours demand (from ${assignedTasks.length} tasks)`);
        console.log(`Calculated capacity for ${staff.full_name} in ${month.key}: ${monthlyCapacity} hours`);

        monthlyData[month.key] = {
          demandHours: monthlyDemand,
          capacityHours: monthlyCapacity,
          gap: monthlyCapacity - monthlyDemand,
          utilizationPercentage: monthlyCapacity > 0 ? (monthlyDemand / monthlyCapacity) * 100 : 0
        };

        totalHours += monthlyDemand;
        totalCapacityHours += monthlyCapacity;
      }

      const overallUtilization = totalCapacityHours > 0 ? (totalHours / totalCapacityHours) * 100 : 0;

      // Calculate revenue metrics
      const expectedHourlyRate = staff.expected_hourly_rate || 0;
      const totalExpectedRevenue = totalHours * expectedHourlyRate;
      const totalSuggestedRevenue = totalHours * (staff.cost_per_hour || 0) * 1.5; // Example markup
      const expectedLessSuggested = totalExpectedRevenue - totalSuggestedRevenue;

      return {
        staffId: staff.id,
        staffName: staff.full_name,
        totalHours,
        totalCapacityHours,
        utilizationPercentage: overallUtilization,
        expectedHourlyRate,
        totalExpectedRevenue,
        totalSuggestedRevenue,
        expectedLessSuggested,
        monthlyData
      };

    } catch (error) {
      console.error(`Error calculating utilization for staff ${staff.full_name}:`, error);
      return null;
    }
  }

  /**
   * Get staff capacity for a specific month using EnhancedAvailabilityService
   * FIXED: Replaced legacy service with enhanced service that parses time slots
   */
  private static async getStaffCapacityForMonth(
    staffId: string,
    month: MonthInfo
  ): Promise<number> {
    try {
      // Use enhanced service to get weekly capacity with proper time slot parsing
      const weeklyCapacitySummary = await this.enhancedAvailabilityService.calculateWeeklyCapacitySummary(staffId);
      
      if (!weeklyCapacitySummary || weeklyCapacitySummary.weeklyHours === 0) {
        console.warn(`No availability found for staff ${staffId}`);
        return 0;
      }

      // Log for debugging
      console.log(`Staff ${staffId} weekly capacity: ${weeklyCapacitySummary.weeklyHours} hours`);

      // Ensure we have valid dates, with fallback to period processing service
      let startDate = month.startDate;
      let endDate = month.endDate;
      
      if (!startDate || !endDate) {
        // Fallback: Generate dates from month key
        const dateRange = PeriodProcessingService.getPeriodDateRange(month.key);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
        
        console.warn(`Month ${month.key} missing dates, generated from key:`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      }

      // Convert weekly to monthly using enhanced service method
      const monthlyCapacity = this.enhancedAvailabilityService.calculateMonthlyCapacity(
        weeklyCapacitySummary.weeklyHours,
        startDate,
        endDate
      );

      console.log(`Staff ${staffId} monthly capacity for ${month.key}: ${monthlyCapacity} hours`);
      
      return monthlyCapacity;
    } catch (error) {
      console.error(`Error calculating capacity for staff ${staffId} in month ${month.key}:`, error);
      return 0;
    }
  }

  /**
   * Calculate monthly demand for assigned tasks using recurrence-aware logic
   * FIXED: Now uses proper recurrence calculations matching Detail Matrix
   */
  private static calculateMonthlyDemand(
    tasks: RecurringTaskDB[],
    month: MonthInfo
  ): number {
    // Add validation for month date boundaries
    if (!month.startDate || !month.endDate) {
      console.warn(`Month ${month.key} missing date boundaries, using month key for calculations`);
    }

    return tasks.reduce((total, task) => {
      // Check if task should appear in this specific month based on recurrence
      const shouldAppear = MonthlyDemandCalculationService.shouldTaskAppearInMonth(task, month.key);
      
      if (!shouldAppear) {
        return total; // Skip tasks not due in this month
      }
      
      // Calculate actual monthly demand based on recurrence pattern
      const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, month.key);
      
      return total + (monthlyDemand.monthlyHours || 0);
    }, 0);
  }

  /**
   * Calculate utilization for unassigned tasks
   * FIXED: Now uses proper recurrence calculations
   */
  private static calculateUnassignedTasksUtilization(
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): StaffUtilizationData | null {
    const unassignedTasks = recurringTasks.filter(task => !task.preferred_staff_id);

    if (unassignedTasks.length === 0) {
      return null;
    }

    const monthlyData: Record<string, any> = {};
    let totalHours = 0;

    for (const month of months) {
      // Use the fixed calculateMonthlyDemand method for unassigned tasks too
      const monthlyDemand = this.calculateMonthlyDemand(unassignedTasks, month);
      
      monthlyData[month.key] = {
        demandHours: monthlyDemand,
        capacityHours: 0,
        gap: -monthlyDemand,
        utilizationPercentage: 0
      };

      totalHours += monthlyDemand;
    }

    return {
      staffId: 'unassigned',
      staffName: 'Unassigned Tasks',
      totalHours,
      totalCapacityHours: 0,
      utilizationPercentage: 0,
      expectedHourlyRate: 0,
      totalExpectedRevenue: 0,
      totalSuggestedRevenue: 0,
      expectedLessSuggested: 0,
      monthlyData
    };
  }

  /**
   * Calculate firm-wide totals
   */
  static calculateFirmWideTotals(utilizationData: StaffUtilizationData[]) {
    const totalDemand = utilizationData.reduce((sum, staff) => sum + staff.totalHours, 0);
    const totalCapacity = utilizationData.reduce((sum, staff) => sum + staff.totalCapacityHours, 0);
    const totalRevenue = utilizationData.reduce((sum, staff) => sum + staff.totalExpectedRevenue, 0);
    const overallUtilization = totalCapacity > 0 ? (totalDemand / totalCapacity) * 100 : 0;
    const totalGap = totalCapacity - totalDemand;

    return {
      totalDemand,
      totalCapacity,
      overallUtilization,
      totalRevenue,
      totalGap
    };
  }
}
