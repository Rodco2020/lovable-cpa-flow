import { supabase } from '@/lib/supabase';
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { AvailabilityService } from '@/services/availability/availabilityService';
import { PeriodProcessingService } from '../demand/matrixTransformer/periodProcessingService';
import { MonthlyDemandCalculationService } from '../demand/matrixTransformer/monthlyDemandCalculationService';
import { staffQueries } from '@/utils/staffQueries';
import { DetailTaskRevenueCalculator } from '../demand/calculators/detailTaskRevenueCalculator';
import { ClientRevenueCalculator } from '../demand/matrixTransformer/clientRevenueCalculator';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';
import type { Task } from '../demand/calculators/detailTaskRevenueCalculator';

/**
 * Staff Forecast Summary Service
 * 
 * Handles calculation of staff utilization data for forecast summary views
 * FIXED: Now uses centralized staff queries to avoid schema mismatch
 */
export class StaffForecastSummaryService {
  private static availabilityService = new AvailabilityService();

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
      const unassignedUtilization = await this.calculateUnassignedTasksUtilization(recurringTasks, months);
      
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

        console.log(`Staff capacity calculated for ${staff.full_name}:`, {
          staffId: staff.id,
          month: month.key,
          monthlyCapacity,
          monthlyDemand,
          hasValidDates: !!(month.startDate && month.endDate)
        });

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

      // FIXED: Calculate revenue metrics using correct methodology per user requirements
      let totalExpectedRevenue = 0;  // Client apportionment methodology 
      let totalSuggestedRevenue = 0; // Skill fee rates calculation
      let expectedHourlyRate = 0;
      
      try {
        // Get skill fee rates for suggested revenue calculation
        const skillFeeRatesMap = await getSkillFeeRatesMap();
        
        // Calculate suggested revenue using skill fee rates (totalHours × skill_fee_rate)
        const primarySkill = assignedTasks[0]?.required_skills?.[0];
        if (primarySkill && skillFeeRatesMap.has(primarySkill)) {
          const skillFeeRate = skillFeeRatesMap.get(primarySkill) || 0;
          totalSuggestedRevenue = totalHours * skillFeeRate;
          expectedHourlyRate = skillFeeRate;
        } else {
          // Fallback to staff cost_per_hour if no skill fee rate found
          expectedHourlyRate = staff.cost_per_hour || 0;
          totalSuggestedRevenue = totalHours * expectedHourlyRate;
        }

        // Calculate expected revenue using client apportionment methodology
        const clientsWithExpectedRevenue = await supabase
          .from('clients')
          .select('id, legal_name, expected_monthly_revenue')
          .eq('status', 'active');
        
        if (clientsWithExpectedRevenue.data && clientsWithExpectedRevenue.data.length > 0) {
          // Transform tasks to format expected by DetailTaskRevenueCalculator
          const tasksForRevenue = assignedTasks.map(task => ({
            id: task.id,
            taskName: task.name,
            clientName: task.clients?.legal_name || 'Unknown Client',
            clientId: task.client_id,
            skillRequired: task.required_skills?.[0] || 'General',
            monthlyHours: totalHours,
            totalHours: totalHours,
            month: months[0]?.key || new Date().toISOString().slice(0, 7),
            monthLabel: months[0]?.label || 'Current Period',
            recurrencePattern: task.recurrence_type || 'Unknown',
            priority: task.priority,
            category: task.category
          }));

          // Build client revenue data
          const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
            clientsWithExpectedRevenue.data,
            tasksForRevenue,
            months.length
          );

          // Calculate revenue using client apportionment for expected revenue
          const tasksWithRevenue = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
            tasksForRevenue,
            clientRevenueData
          );

          // Create a map of task revenues by task ID for quick lookup
          const taskRevenueMap = new Map(
            Array.from(tasksWithRevenue.entries()).map(([taskId, revenueResult]) => [taskId, revenueResult.totalExpectedRevenue || 0])
          );

          // Calculate expected revenue using client apportionment
          totalExpectedRevenue = assignedTasks.reduce((sum, task) => {
            return sum + (taskRevenueMap.get(task.id) || 0);
          }, 0);
        }
      } catch (error) {
        console.error(`Error calculating revenue for staff ${staff.full_name}:`, error);
        expectedHourlyRate = staff.cost_per_hour || 0;
        totalSuggestedRevenue = totalHours * expectedHourlyRate;
        totalExpectedRevenue = 0;
      }

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
   * Get staff capacity for a specific month with fallback date generation
   * PHASE 2 FIX: Add fallback to generate dates from month key
   */
  private static async getStaffCapacityForMonth(
    staffId: string,
    month: MonthInfo
  ): Promise<number> {
    try {
      // Get weekly capacity
      const availability = await this.availabilityService.getAvailabilityForStaff(staffId);
      if (!availability || availability.length === 0) {
        return 0;
      }

      const weeklyCapacityHours = this.availabilityService.calculateWeeklyCapacity(availability);
      
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
      
      // Convert to monthly with valid dates
      return this.availabilityService.convertWeeklyToMonthlyCapacity(
        weeklyCapacityHours,
        startDate,
        endDate
      );
    } catch (error) {
      console.error(`Error calculating capacity for staff ${staffId} in month ${month.key}:`, error);
      return 0;
    }
  }

  /**
   * Calculate monthly demand for assigned tasks using monthlyDistribution data
   * FIXED: Now uses monthlyDistribution which contains the correct monthly hours
   */
  private static calculateMonthlyDemand(
    tasks: RecurringTaskDB[],
    month: MonthInfo
  ): number {
    console.log(`🔍 [MONTHLY DEMAND] Calculating demand for month ${month.key} with ${tasks.length} tasks`);
    
    return tasks.reduce((total, task) => {
      try {
        // Use monthlyDistribution data for month-specific hours
        const monthKey = month.key; // Should be in format "YYYY-MM"
        const monthlyHours = (task as any).monthlyDistribution?.[monthKey] || 0;
        
        console.log(`📊 [MONTHLY DEMAND] Task ${task.id} (${task.name}) in ${month.key}:`, {
          monthlyHours,
          monthKey,
          hasDistribution: !!((task as any).monthlyDistribution),
          distributionKeys: Object.keys((task as any).monthlyDistribution || {})
        });
        
        return total + monthlyHours;
      } catch (error) {
        console.error(`❌ [MONTHLY DEMAND] Error calculating demand for task ${task.id}:`, error);
        return total;
      }
    }, 0);
  }

  /**
   * Calculate utilization for unassigned tasks
   * FIXED: Now uses same revenue calculation methodology as assigned tasks
   */
  private static async calculateUnassignedTasksUtilization(
    recurringTasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData | null> {
    const unassignedTasks = recurringTasks.filter(task => !task.preferred_staff_id);

    if (unassignedTasks.length === 0) {
      return null;
    }

    const monthlyData: Record<string, any> = {};
    let totalHours = 0;

    for (const month of months) {
      const monthlyDemand = this.calculateMonthlyDemand(unassignedTasks, month);
      
      monthlyData[month.key] = {
        demandHours: monthlyDemand,
        capacityHours: 0,
        gap: -monthlyDemand,
        utilizationPercentage: 0
      };

      totalHours += monthlyDemand;
    }

    // FIXED: Calculate revenue using correct methodology per user requirements for unassigned tasks
    let totalExpectedRevenue = 0;  // Client apportionment methodology
    let totalSuggestedRevenue = 0; // Skill fee rates calculation
    let expectedHourlyRate = 0;
    
    try {
      // Get skill fee rates for suggested revenue calculation
      const skillFeeRatesMap = await getSkillFeeRatesMap();
      
      // Calculate suggested revenue using skill fee rates for unassigned tasks
      if (totalHours > 0) {
        const primarySkill = unassignedTasks[0]?.required_skills?.[0];
        if (primarySkill && skillFeeRatesMap.has(primarySkill)) {
          const skillFeeRate = skillFeeRatesMap.get(primarySkill) || 0;
          totalSuggestedRevenue = totalHours * skillFeeRate;
          expectedHourlyRate = skillFeeRate;
        } else {
          // Fallback to default rate for unassigned tasks
          expectedHourlyRate = 100; // Default rate
          totalSuggestedRevenue = totalHours * expectedHourlyRate;
        }

        // Calculate expected revenue using client apportionment methodology
        const clientsWithExpectedRevenue = await supabase
          .from('clients')
          .select('id, legal_name, expected_monthly_revenue')
          .eq('status', 'active');
        
        if (clientsWithExpectedRevenue.data && clientsWithExpectedRevenue.data.length > 0) {
          // Transform unassigned tasks to format expected by DetailTaskRevenueCalculator
          const tasksForRevenue = unassignedTasks.map(task => ({
            id: task.id,
            taskName: task.name,
            clientName: task.clients?.legal_name || 'Unknown Client',
            clientId: task.client_id,
            skillRequired: task.required_skills?.[0] || 'General',
            monthlyHours: totalHours,
            totalHours: totalHours,
            month: months[0]?.key || new Date().toISOString().slice(0, 7),
            monthLabel: months[0]?.label || 'Current Period',
            recurrencePattern: task.recurrence_type || 'Unknown',
            priority: task.priority,
            category: task.category
          }));

          // Build client revenue data
          const clientRevenueData = DetailTaskRevenueCalculator.buildClientRevenueData(
            clientsWithExpectedRevenue.data,
            tasksForRevenue,
            months.length
          );

          // Calculate revenue for unassigned tasks using client apportionment
          const tasksWithRevenue = await DetailTaskRevenueCalculator.calculateBulkTaskRevenue(
            tasksForRevenue,
            clientRevenueData
          );

          // Calculate expected revenue using client apportionment
          totalExpectedRevenue = unassignedTasks.reduce((sum, task) => {
            const revenueResult = tasksWithRevenue.get(task.id);
            return sum + (revenueResult?.totalExpectedRevenue || 0);
          }, 0);
        }
      }
    } catch (error) {
      console.error('Error calculating revenue for unassigned tasks:', error);
      expectedHourlyRate = 100; // Default fallback
      totalSuggestedRevenue = totalHours * expectedHourlyRate;
      totalExpectedRevenue = 0;
    }

    return {
      staffId: 'unassigned',
      staffName: 'Unassigned Tasks',
      totalHours,
      totalCapacityHours: 0,
      utilizationPercentage: 0,
      expectedHourlyRate,
      totalExpectedRevenue,
      totalSuggestedRevenue,
      expectedLessSuggested: totalExpectedRevenue - totalSuggestedRevenue,
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
