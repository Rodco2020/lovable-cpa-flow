
import { StaffUtilizationData, MonthInfo } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { DetailMatrixDataService } from '@/services/forecasting/matrix/detailMatrixDataService';
import { MonthlyDemandCalculationService } from './monthlyDemandCalculationService';

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
    const monthlyData = months.map(month => {
      const demand = this.calculateMonthlyDemandForStaff(staffTasks, month, staff.name);
      const capacity = 160; // Standard monthly capacity (40 hours/week * 4 weeks)
      
      return {
        month: month.key,
        demand,
        capacity,
        utilization: capacity > 0 ? (demand / capacity) * 100 : 0
      };
    });
    
    // PHASE 4: Add verification logging for Ana
    if (staff.name === 'Ana Florian') {
      console.log(`🎯 [ANA VERIFICATION] Ana Florian monthly breakdown:`, monthlyData);
      console.log(`🎯 [ANA VERIFICATION] Expected: 48.7, 39.7, 39.7, 48.7, 39.7, 39.7, 104.7, 39.7, 39.7, 48.7, 39.7, 39.7`);
    }
    
    // Calculate totals
    const totalHours = monthlyData.reduce((sum, month) => sum + month.demand, 0);
    const totalCapacity = monthlyData.reduce((sum, month) => sum + month.capacity, 0);
    const utilizationPercentage = totalCapacity > 0 ? (totalHours / totalCapacity) * 100 : 0;
    
    // Calculate revenue (simplified - could be enhanced with actual rates)
    const avgHourlyRate = 75; // Default rate
    const totalExpectedRevenue = totalHours * avgHourlyRate;
    
    return {
      staffId: staff.id,
      staffName: staff.name,
      totalHours,
      totalCapacity,
      utilizationPercentage,
      totalExpectedRevenue,
      monthlyData,
      gap: totalHours - totalCapacity
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
    const monthlyData = months.map(month => {
      const demand = this.calculateMonthlyDemandForStaff(unassignedTasks, month, 'Unassigned');
      
      return {
        month: month.key,
        demand,
        capacity: 0, // No capacity for unassigned
        utilization: 0
      };
    });
    
    const totalHours = monthlyData.reduce((sum, month) => sum + month.demand, 0);
    
    return {
      staffId: 'unassigned',
      staffName: 'Unassigned Tasks',
      totalHours,
      totalCapacity: 0,
      utilizationPercentage: 0,
      totalExpectedRevenue: 0,
      monthlyData,
      gap: totalHours
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
    
    const totals = utilizationData.reduce((acc, staff) => ({
      totalDemand: acc.totalDemand + staff.totalHours,
      totalCapacity: acc.totalCapacity + staff.totalCapacity,
      totalRevenue: acc.totalRevenue + staff.totalExpectedRevenue,
      totalGap: acc.totalGap + staff.gap
    }), {
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
