import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { DemandDrillDownData, DemandClientBreakdown, DemandTaskBreakdown, RecurrencePatternSummary } from '@/types/demandDrillDown';
import { debugLog } from '../logger';

/**
 * Demand Drill-Down Service - Phase 4 Enhanced
 * Provides detailed drill-down analysis with staff assignment information
 */
export class DemandDrillDownService {
  /**
   * Phase 4: Enhanced drill-down data generation with staff information
   */
  static generateDrillDownData(
    demandData: DemandMatrixData,
    skill: SkillType,
    month: string
  ): DemandDrillDownData {
    debugLog(`[PHASE 4] Generating enhanced demand drill-down for ${skill} in ${month}`);

    const dataPoint = demandData.dataPoints.find(
      point => point.skillType === skill && point.month === month
    );

    if (!dataPoint) {
      throw new Error(`No data found for ${skill} in ${month}`);
    }

    const monthObj = demandData.months.find(m => m.key === month);
    const monthLabel = monthObj?.label || month;

    // Generate enhanced breakdowns with staff information
    const clientBreakdown = this.generateClientBreakdownWithStaff(dataPoint.taskBreakdown);
    const taskBreakdown = this.generateTaskBreakdownWithStaff(dataPoint.taskBreakdown);
    const recurrencePatternSummary = this.generateRecurrencePatternSummary(dataPoint.taskBreakdown);
    
    // Phase 4: Generate staff assignment summary
    const staffAssignmentSummary = this.generateStaffAssignmentSummary(dataPoint.taskBreakdown);
    
    // Calculate trends with staff assignment context
    const trends = this.calculateTrendsWithStaffContext(demandData, skill, month);

    const drillDownData = {
      skill,
      month,
      monthLabel,
      totalDemandHours: dataPoint.demandHours,
      taskCount: dataPoint.taskCount,
      clientCount: dataPoint.clientCount,
      clientBreakdown,
      taskBreakdown,
      recurrencePatternSummary,
      trends,
      // Phase 4: Enhanced with staff information
      staffAssignmentSummary,
      unassignedHours: dataPoint.unassignedHours || 0,
      assignedHours: dataPoint.assignedHours || 0,
      assignmentRate: dataPoint.demandHours > 0 ? 
        ((dataPoint.assignedHours || 0) / dataPoint.demandHours * 100) : 0
    };

    console.log('📊 [PHASE 4] Enhanced drill-down data generated:', {
      skill,
      month,
      totalHours: drillDownData.totalDemandHours,
      unassignedHours: drillDownData.unassignedHours,
      assignedHours: drillDownData.assignedHours,
      assignmentRate: `${drillDownData.assignmentRate.toFixed(1)}%`,
      staffCount: staffAssignmentSummary.length
    });

    return drillDownData;
  }

  /**
   * Phase 4: Generate client breakdown with staff assignment information
   */
  private static generateClientBreakdownWithStaff(tasks: any[]): DemandClientBreakdown[] {
    const clientMap = new Map<string, {
      clientId: string;
      clientName: string;
      demandHours: number;
      taskCount: number;
      recurringTasks: number;
      adhocTasks: number;
      // Phase 4: Enhanced with staff information
      assignedHours: number;
      unassignedHours: number;
      assignedTasks: number;
      unassignedTasks: number;
      staffAssignments: Set<string>;
    }>();

    tasks.forEach(task => {
      const existing = clientMap.get(task.clientId);
      const isUnassigned = task.isUnassigned || false;
      const taskHours = task.monthlyHours || 0;
      
      if (existing) {
        existing.demandHours += taskHours;
        existing.taskCount += 1;
        
        // Track assignment status
        if (isUnassigned) {
          existing.unassignedHours += taskHours;
          existing.unassignedTasks += 1;
        } else {
          existing.assignedHours += taskHours;
          existing.assignedTasks += 1;
          if (task.preferredStaffId) {
            existing.staffAssignments.add(task.preferredStaffId);
          }
        }
        
        if (task.recurrencePattern?.type) {
          existing.recurringTasks += 1;
        } else {
          existing.adhocTasks += 1;
        }
      } else {
        clientMap.set(task.clientId, {
          clientId: task.clientId,
          clientName: task.clientName,
          demandHours: taskHours,
          taskCount: 1,
          recurringTasks: task.recurrencePattern?.type ? 1 : 0,
          adhocTasks: task.recurrencePattern?.type ? 0 : 1,
          assignedHours: isUnassigned ? 0 : taskHours,
          unassignedHours: isUnassigned ? taskHours : 0,
          assignedTasks: isUnassigned ? 0 : 1,
          unassignedTasks: isUnassigned ? 1 : 0,
          staffAssignments: new Set(task.preferredStaffId ? [task.preferredStaffId] : [])
        });
      }
    });

    return Array.from(clientMap.values()).map(client => ({
      ...client,
      averageTaskSize: client.taskCount > 0 ? client.demandHours / client.taskCount : 0,
      // Phase 4: Enhanced with assignment metrics
      assignmentRate: client.demandHours > 0 ? (client.assignedHours / client.demandHours * 100) : 0,
      uniqueStaffCount: client.staffAssignments.size,
      staffAssignments: undefined // Remove Set from final output
    })).sort((a, b) => b.demandHours - a.demandHours);
  }

  /**
   * Phase 4: Generate task breakdown with enhanced staff information
   */
  private static generateTaskBreakdownWithStaff(tasks: any[]): DemandTaskBreakdown[] {
    return tasks.map(task => {
      // Determine assignment status with proper typing
      let assignmentStatus: 'Assigned' | 'Unassigned' | 'Unknown';
      if (task.isUnassigned) {
        assignmentStatus = 'Unassigned';
      } else if (task.preferredStaffId) {
        assignmentStatus = 'Assigned';
      } else {
        assignmentStatus = 'Unknown';
      }

      return {
        taskId: task.recurringTaskId || `adhoc-${Date.now()}`,
        taskName: task.taskName,
        clientId: task.clientId,
        clientName: task.clientName,
        skillType: task.skillType,
        estimatedHours: task.estimatedHours,
        monthlyHours: task.monthlyHours,
        recurrenceType: task.recurrencePattern?.type || 'None',
        recurrenceFrequency: task.recurrencePattern?.frequency || 0,
        isRecurring: !!task.recurrencePattern?.type,
        // Phase 4: Enhanced with staff assignment details
        preferredStaffId: task.preferredStaffId,
        isUnassigned: task.isUnassigned || false,
        staffInfo: task.staffInfo || null,
        assignmentStatus
      };
    }).sort((a, b) => b.monthlyHours - a.monthlyHours);
  }

  /**
   * Generate recurrence pattern summary (unchanged)
   */
  private static generateRecurrencePatternSummary(tasks: any[]): RecurrencePatternSummary[] {
    const patternMap = new Map<string, { taskCount: number; totalHours: number }>();
    
    tasks.forEach(task => {
      const pattern = task.recurrencePattern?.type || 'Ad-hoc';
      const existing = patternMap.get(pattern);
      
      if (existing) {
        existing.taskCount += 1;
        existing.totalHours += task.monthlyHours;
      } else {
        patternMap.set(pattern, {
          taskCount: 1,
          totalHours: task.monthlyHours
        });
      }
    });

    const totalHours = tasks.reduce((sum, task) => sum + task.monthlyHours, 0);
    
    return Array.from(patternMap.entries()).map(([pattern, data]) => ({
      pattern,
      taskCount: data.taskCount,
      totalHours: data.totalHours,
      percentage: totalHours > 0 ? (data.totalHours / totalHours) * 100 : 0
    })).sort((a, b) => b.totalHours - a.totalHours);
  }

  /**
   * Phase 4: Generate staff assignment summary for drill-down
   */
  private static generateStaffAssignmentSummary(tasks: any[]): Array<{
    staffId: string;
    staffName: string;
    isUnassigned: boolean;
    taskCount: number;
    totalHours: number;
    percentage: number;
  }> {
    const staffMap = new Map<string, {
      staffId: string;
      staffName: string;
      isUnassigned: boolean;
      taskCount: number;
      totalHours: number;
    }>();

    tasks.forEach(task => {
      const staffKey = task.isUnassigned ? 'UNASSIGNED' : (task.preferredStaffId || 'UNKNOWN');
      const staffName = task.isUnassigned ? 'Unassigned Tasks' : 
        (task.staffInfo?.name || `Staff ${staffKey.slice(0, 8)}`);
      
      const existing = staffMap.get(staffKey);
      if (existing) {
        existing.taskCount += 1;
        existing.totalHours += task.monthlyHours || 0;
      } else {
        staffMap.set(staffKey, {
          staffId: staffKey,
          staffName,
          isUnassigned: task.isUnassigned || false,
          taskCount: 1,
          totalHours: task.monthlyHours || 0
        });
      }
    });

    const totalHours = tasks.reduce((sum, task) => sum + (task.monthlyHours || 0), 0);
    
    return Array.from(staffMap.values()).map(staff => ({
      ...staff,
      percentage: totalHours > 0 ? (staff.totalHours / totalHours * 100) : 0
    })).sort((a, b) => b.totalHours - a.totalHours);
  }

  /**
   * Phase 4: Calculate trends with staff assignment context
   */
  private static calculateTrendsWithStaffContext(
    demandData: DemandMatrixData, 
    skill: SkillType, 
    month: string
  ) {
    // In a real implementation, this would calculate actual trends from historical data
    // For now, return enhanced mock trends with staff context
    const currentDataPoint = demandData.dataPoints.find(
      point => point.skillType === skill && point.month === month
    );

    const assignmentRate = currentDataPoint && currentDataPoint.demandHours > 0 ? 
      ((currentDataPoint.assignedHours || 0) / currentDataPoint.demandHours * 100) : 0;

    return {
      demandTrend: Math.random() * 20 - 10, // -10% to +10%
      taskGrowth: Math.random() * 15 - 5,   // -5% to +10%
      clientGrowth: Math.random() * 10 - 2, // -2% to +8%
      // Phase 4: Enhanced with staff assignment trends
      assignmentRate,
      assignmentTrend: Math.random() * 30 - 15, // -15% to +15%
      staffUtilizationTrend: Math.random() * 25 - 10 // -10% to +15%
    };
  }
}
