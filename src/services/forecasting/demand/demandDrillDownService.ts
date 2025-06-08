
import { SkillType } from '@/types/task';
import { DemandMatrixData } from '@/types/demand';
import { DemandDrillDownData, DemandClientBreakdown, DemandTaskBreakdown, RecurrencePatternSummary } from '@/types/demandDrillDown';
import { debugLog } from '../logger';

/**
 * Demand Drill-Down Service
 * Provides detailed drill-down analysis for demand matrix cells
 */
export class DemandDrillDownService {
  /**
   * Generate drill-down data for a specific skill and month
   */
  static generateDrillDownData(
    demandData: DemandMatrixData,
    skill: SkillType,
    month: string
  ): DemandDrillDownData {
    debugLog(`Generating demand drill-down for ${skill} in ${month}`);

    const dataPoint = demandData.dataPoints.find(
      point => point.skillType === skill && point.month === month
    );

    if (!dataPoint) {
      throw new Error(`No data found for ${skill} in ${month}`);
    }

    const monthObj = demandData.months.find(m => m.key === month);
    const monthLabel = monthObj?.label || month;

    // Generate client breakdown
    const clientBreakdown = this.generateClientBreakdown(dataPoint.taskBreakdown);
    
    // Generate task breakdown
    const taskBreakdown = this.generateTaskBreakdown(dataPoint.taskBreakdown);
    
    // Generate recurrence pattern summary
    const recurrencePatternSummary = this.generateRecurrencePatternSummary(dataPoint.taskBreakdown);
    
    // Calculate trends (mock data for now - would be calculated from historical data)
    const trends = this.calculateTrends(demandData, skill, month);

    return {
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
   * Generate task breakdown
   */
  private static generateTaskBreakdown(tasks: any[]): DemandTaskBreakdown[] {
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
      isRecurring: !!task.recurrencePattern?.type
    })).sort((a, b) => b.monthlyHours - a.monthlyHours);
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
   * Calculate trends (mock implementation)
   */
  private static calculateTrends(demandData: DemandMatrixData, skill: SkillType, month: string) {
    // In a real implementation, this would calculate actual trends from historical data
    // For now, return mock trends
    return {
      demandTrend: Math.random() * 20 - 10, // -10% to +10%
      taskGrowth: Math.random() * 15 - 5, // -5% to +10%
      clientGrowth: Math.random() * 10 - 2 // -2% to +8%
    };
  }
}
