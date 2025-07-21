
import { StaffUtilizationData, MonthInfo, MonthlyStaffMetrics } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { MonthlyDemandCalculationService } from '@/services/forecasting/demand/matrixTransformer/monthlyDemandCalculationService';

// PHASE 3: Type extension for TypeScript
interface RecurringTaskWithDistribution extends RecurringTaskDB {
  monthlyDistribution?: Record<string, number>;
}

export class StaffForecastSummaryService {
  
  /**
   * Calculate staff utilization data for the forecast summary
   */
  static async calculateStaffUtilization(
    forecastPeriods: ForecastData[],
    tasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData[]> {
    
    console.log('🔄 [STAFF SUMMARY SERVICE] Starting staff utilization calculation:', {
      taskCount: tasks.length,
      monthCount: months.length,
      forecastPeriods: forecastPeriods.length
    });
    
    try {
      // Get unique staff members from tasks
      const staffMap = new Map<string, { id: string; name: string }>();
      
      tasks.forEach(task => {
        if (task.preferred_staff_id && task.staff?.full_name) {
          staffMap.set(task.preferred_staff_id, {
            id: task.preferred_staff_id,
            name: task.staff.full_name
          });
        }
      });
      
      // Calculate utilization for each staff member
      const utilizationPromises = Array.from(staffMap.values()).map(staff =>
        this.calculateIndividualStaffUtilization(staff, tasks, months)
      );
      
      const utilizationResults = await Promise.all(utilizationPromises);
      
      // Add unassigned tasks summary
      const unassignedUtilization = await this.calculateUnassignedTasksUtilization(tasks, months);
      if (unassignedUtilization) {
        utilizationResults.push(unassignedUtilization);
      }
      
      console.log('✅ [STAFF SUMMARY SERVICE] Utilization calculation complete:', {
        totalStaff: utilizationResults.length,
        assignedStaff: utilizationResults.filter(s => s.staffId !== 'unassigned').length
      });
      
      return utilizationResults;
      
    } catch (error) {
      console.error('❌ [STAFF SUMMARY SERVICE] Error calculating staff utilization:', error);
      throw error;
    }
  }
  
  /**
   * Calculate utilization for an individual staff member
   */
  private static async calculateIndividualStaffUtilization(
    staff: { id: string; name: string },
    tasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData> {
    
    // Filter tasks assigned to this staff member
    const staffTasks = tasks.filter(task => task.preferred_staff_id === staff.id);
    
    // Calculate monthly data
    const monthlyData: Record<string, MonthlyStaffMetrics> = {};
    
    months.forEach(month => {
      const demandHours = this.calculateMonthlyDemandForStaff(staffTasks, month, staff.name);
      const capacityHours = 160; // Standard monthly capacity (40 hours/week * 4 weeks)
      const gap = demandHours - capacityHours;
      const utilizationPercentage = capacityHours > 0 ? (demandHours / capacityHours) * 100 : 0;
      
      monthlyData[month.key] = {
        demandHours,
        capacityHours,
        gap,
        utilizationPercentage
      };
    });
    
    // PHASE 4: Add verification logging for Ana
    if (staff.name === 'Ana Florian') {
      console.log(`🎯 [ANA VERIFICATION] Ana Florian monthly breakdown:`, monthlyData);
      console.log(`🎯 [ANA VERIFICATION] Expected: 48.7, 39.7, 39.7, 48.7, 39.7, 39.7, 104.7, 39.7, 39.7, 48.7, 39.7, 39.7`);
    }
    
    // Calculate totals
    const totalHours = Object.values(monthlyData).reduce((sum, month) => sum + month.demandHours, 0);
    const totalCapacityHours = Object.values(monthlyData).reduce((sum, month) => sum + month.capacityHours, 0);
    const utilizationPercentage = totalCapacityHours > 0 ? (totalHours / totalCapacityHours) * 100 : 0;
    
    // Calculate revenue (simplified - could be enhanced with actual rates)
    const expectedHourlyRate = 75; // Default rate
    const totalExpectedRevenue = totalHours * expectedHourlyRate;
    
    return {
      staffId: staff.id,
      staffName: staff.name,
      totalHours,
      totalCapacityHours,
      utilizationPercentage,
      expectedHourlyRate,
      totalExpectedRevenue,
      totalSuggestedRevenue: totalExpectedRevenue, // Same as expected for now
      expectedLessSuggested: 0, // No difference for now
      monthlyData
    };
  }
  
  /**
   * PHASE 2: Calculate monthly demand for a staff member using preserved monthlyDistribution
   */
  private static calculateMonthlyDemandForStaff(
    tasks: RecurringTaskDB[],
    month: MonthInfo,
    staffName: string
  ): number {
    let totalDemand = 0;
    
    for (const task of tasks) {
      let taskHours = 0;
      
      // PRIORITY: Use pre-computed monthlyDistribution if available
      const taskWithDistribution = task as RecurringTaskWithDistribution;
      if (taskWithDistribution.monthlyDistribution && taskWithDistribution.monthlyDistribution[month.key]) {
        taskHours = taskWithDistribution.monthlyDistribution[month.key];
        
        // Log for Ana to verify the fix
        if (staffName === 'Ana Florian') {
          console.log(`🎯 [USING DISTRIBUTION] Using monthlyDistribution for ${task.name} in ${month.key}: ${taskHours}h`);
        }
      } else {
        // Fallback to recalculation only if monthlyDistribution is missing
        const shouldAppear = MonthlyDemandCalculationService.shouldTaskAppearInMonth(task, month.key);
        
        if (shouldAppear) {
          const monthlyDemand = MonthlyDemandCalculationService.calculateTaskDemandForMonth(task, month.key);
          taskHours = monthlyDemand.monthlyHours || 0;
          
          if (staffName === 'Ana Florian') {
            console.log(`🔄 [RECALCULATED] Recalculated ${task.name} for ${month.key}: ${taskHours}h`);
          }
        }
      }
      
      totalDemand += taskHours;
    }
    
    return totalDemand;
  }
  
  /**
   * Calculate utilization for unassigned tasks
   */
  private static async calculateUnassignedTasksUtilization(
    tasks: RecurringTaskDB[],
    months: MonthInfo[]
  ): Promise<StaffUtilizationData | null> {
    
    // Filter tasks without preferred staff assignment
    const unassignedTasks = tasks.filter(task => !task.preferred_staff_id);
    
    if (unassignedTasks.length === 0) {
      return null;
    }
    
    // Calculate monthly data for unassigned tasks
    const monthlyData: Record<string, MonthlyStaffMetrics> = {};
    
    months.forEach(month => {
      const demandHours = this.calculateMonthlyDemandForStaff(unassignedTasks, month, 'Unassigned');
      
      monthlyData[month.key] = {
        demandHours,
        capacityHours: 0, // No capacity for unassigned
        gap: demandHours, // All demand is gap since no capacity
        utilizationPercentage: 0
      };
    });
    
    const totalHours = Object.values(monthlyData).reduce((sum, month) => sum + month.demandHours, 0);
    
    return {
      staffId: 'unassigned',
      staffName: 'Unassigned Tasks',
      totalHours,
      totalCapacityHours: 0,
      utilizationPercentage: 0,
      expectedHourlyRate: 75,
      totalExpectedRevenue: 0,
      totalSuggestedRevenue: 0,
      expectedLessSuggested: 0,
      monthlyData
    };
  }
  
  /**
   * Calculate firm-wide totals from staff utilization data
   */
  static calculateFirmWideTotals(utilizationData: StaffUtilizationData[]): {
    totalDemand: number;
    totalCapacity: number;
    overallUtilization: number;
    totalRevenue: number;
    totalGap: number;
  } {
    
    const totals = utilizationData.reduce((acc, staff) => {
      const staffGap = staff.totalHours - staff.totalCapacityHours;
      return {
        totalDemand: acc.totalDemand + staff.totalHours,
        totalCapacity: acc.totalCapacity + staff.totalCapacityHours,
        totalRevenue: acc.totalRevenue + staff.totalExpectedRevenue,
        totalGap: acc.totalGap + staffGap
      };
    }, {
      totalDemand: 0,
      totalCapacity: 0,
      totalRevenue: 0,
      totalGap: 0
    });
    
    const overallUtilization = totals.totalCapacity > 0 
      ? (totals.totalDemand / totals.totalCapacity) * 100 
      : 0;
    
    return {
      ...totals,
      overallUtilization
    };
  }
}
