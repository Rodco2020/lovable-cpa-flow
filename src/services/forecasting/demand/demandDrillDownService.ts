
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { DemandDrillDownData, DemandClientBreakdown, DemandTaskBreakdown, RecurrencePatternSummary } from '@/types/demandDrillDown';
import { debugLog } from '../logger';

/**
 * Enhanced Demand Drill-Down Service with Preferred Staff Support
 * Provides detailed drill-down analysis for demand matrix cells including preferred staff information
 */
export class DemandDrillDownService {
  /**
   * Generate enhanced drill-down data with preferred staff information
   */
  static generateDrillDownData(
    demandData: DemandMatrixData,
    skill: SkillType,
    month: string
  ): DemandDrillDownData {
    debugLog(`Generating enhanced demand drill-down for ${skill} in ${month}`);

    const dataPoint = demandData.dataPoints.find(
      point => point.skillType === skill && point.month === month
    );

    if (!dataPoint) {
      throw new Error(`No data found for ${skill} in ${month}`);
    }

    const monthObj = demandData.months.find(m => m.key === month);
    const monthLabel = monthObj?.label || month;

    // Generate enhanced breakdowns with preferred staff information
    const clientBreakdown = this.generateClientBreakdown(dataPoint.taskBreakdown);
    const taskBreakdown = this.generateEnhancedTaskBreakdown(dataPoint.taskBreakdown);
    const recurrencePatternSummary = this.generateRecurrencePatternSummary(dataPoint.taskBreakdown);
    
    // Calculate trends with preferred staff context
    const trends = this.calculateTrends(demandData, skill, month);

    const drillDownData: DemandDrillDownData = {
      skill,
      month,
      monthLabel,
      totalDemandHours: dataPoint.demandHours,
      taskCount: dataPoint.taskCount,
      clientCount: dataPoint.clientCount,
      clientBreakdown,
      taskBreakdown,
      recurrencePatternSummary,
      trends
    };

    // Log preferred staff statistics
    const tasksWithPreferredStaff = taskBreakdown.filter(task => task.preferredStaffId).length;
    const preferredStaffCoverage = taskBreakdown.length > 0 ? (tasksWithPreferredStaff / taskBreakdown.length) * 100 : 0;
    
    console.log(`📊 [DRILL DOWN] ${skill} - ${monthLabel}: ${taskBreakdown.length} tasks, ${tasksWithPreferredStaff} with preferred staff (${preferredStaffCoverage.toFixed(0)}% coverage)`);

    return drillDownData;
  }

  /**
   * Generate client breakdown from task data
   */
  private static generateClientBreakdown(tasks: any[]): DemandClientBreakdown[] {
    const clientMap = new Map<string, {
      clientId: string;
      clientName: string;
      demandHours: number;
      taskCount: number;
      recurringTasks: number;
      adhocTasks: number;
    }>();

    tasks.forEach(task => {
      const existing = clientMap.get(task.clientId);
      if (existing) {
        existing.demandHours += task.monthlyHours;
        existing.taskCount += 1;
        if (task.recurrencePattern?.type) {
          existing.recurringTasks += 1;
        } else {
          existing.adhocTasks += 1;
        }
      } else {
        clientMap.set(task.clientId, {
          clientId: task.clientId,
          clientName: task.clientName,
          demandHours: task.monthlyHours,
          taskCount: 1,
          recurringTasks: task.recurrencePattern?.type ? 1 : 0,
          adhocTasks: task.recurrencePattern?.type ? 0 : 1
        });
      }
    });

    return Array.from(clientMap.values()).map(client => ({
      ...client,
      averageTaskSize: client.taskCount > 0 ? client.demandHours / client.taskCount : 0
    })).sort((a, b) => b.demandHours - a.demandHours);
  }

  /**
   * Generate enhanced task breakdown with preferred staff information
   */
  private static generateEnhancedTaskBreakdown(tasks: any[]): DemandTaskBreakdown[] {
    return tasks.map(task => ({
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
      // Enhanced: Include preferred staff information
      preferredStaffId: task.preferredStaff?.staffId || undefined,
      preferredStaffName: task.preferredStaff?.staffName || undefined,
      preferredStaffRole: task.preferredStaff?.roleTitle || undefined
    })).sort((a, b) => {
      // Sort by preferred staff status first, then by hours
      if (a.preferredStaffId && !b.preferredStaffId) return -1;
      if (!a.preferredStaffId && b.preferredStaffId) return 1;
      return b.monthlyHours - a.monthlyHours;
    });
  }

  /**
   * Generate recurrence pattern summary
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
   * Calculate trends with preferred staff context
   */
  private static calculateTrends(demandData: DemandMatrixData, skill: SkillType, month: string) {
    // In a real implementation, this would calculate actual trends from historical data
    // For now, return mock trends that consider preferred staff assignments
    const currentMonthData = demandData.dataPoints.find(p => p.skillType === skill && p.month === month);
    const tasksWithPreferredStaff = currentMonthData?.taskBreakdown?.filter(task => task.preferredStaff?.staffId).length || 0;
    const totalTasks = currentMonthData?.taskCount || 1;
    const preferredStaffRatio = tasksWithPreferredStaff / totalTasks;
    
    // Adjust trends based on preferred staff coverage
    const baseGrowth = Math.random() * 20 - 10;
    const preferredStaffBonus = preferredStaffRatio * 5; // Better coverage = slightly better trends
    
    return {
      demandTrend: baseGrowth + preferredStaffBonus,
      taskGrowth: Math.random() * 15 - 5,
      clientGrowth: Math.random() * 10 - 2
    };
  }

  /**
   * Get preferred staff statistics for a drill-down
   */
  static getPreferredStaffStatistics(data: DemandDrillDownData) {
    const tasksWithPreferredStaff = data.taskBreakdown.filter(task => task.preferredStaffId).length;
    const tasksWithoutPreferredStaff = data.taskBreakdown.length - tasksWithPreferredStaff;
    const coverage = data.taskBreakdown.length > 0 ? (tasksWithPreferredStaff / data.taskBreakdown.length) * 100 : 0;
    
    // Group by preferred staff
    const staffGroups = data.taskBreakdown.reduce((acc, task) => {
      const staffKey = task.preferredStaffId || 'unassigned';
      if (!acc[staffKey]) {
        acc[staffKey] = {
          staffId: staffKey,
          staffName: task.preferredStaffName || 'No Preferred Staff',
          taskCount: 0,
          totalHours: 0
        };
      }
      acc[staffKey].taskCount += 1;
      acc[staffKey].totalHours += task.monthlyHours;
      return acc;
    }, {} as Record<string, any>);

    return {
      tasksWithPreferredStaff,
      tasksWithoutPreferredStaff,
      coverage,
      staffGroups: Object.values(staffGroups),
      uniquePreferredStaffCount: Object.keys(staffGroups).length - (staffGroups['unassigned'] ? 1 : 0)
    };
  }
}
