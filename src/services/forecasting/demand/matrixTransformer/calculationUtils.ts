
import { DemandDataPoint } from '@/types/demand';
import { SkillType } from '@/types/task';
import { MatrixTotals, SkillSummary } from './types';

/**
 * Utility functions for matrix calculations and summaries
 */
export class CalculationUtils {
  /**
   * Calculate totals safely
   */
  static calculateTotals(dataPoints: DemandDataPoint[]): MatrixTotals {
    try {
      if (!Array.isArray(dataPoints)) {
        return { totalDemand: 0, totalTasks: 0, totalClients: 0 };
      }

      const totalDemand = dataPoints.reduce((sum, point) => {
        const hours = typeof point.demandHours === 'number' ? point.demandHours : 0;
        return sum + Math.max(0, hours);
      }, 0);

      const totalTasks = dataPoints.reduce((sum, point) => {
        const tasks = typeof point.taskCount === 'number' ? point.taskCount : 0;
        return sum + Math.max(0, tasks);
      }, 0);

      const allClientIds = new Set<string>();
      dataPoints.forEach(point => {
        if (Array.isArray(point.taskBreakdown)) {
          point.taskBreakdown.forEach(task => {
            if (task && typeof task.clientId === 'string') {
              allClientIds.add(task.clientId);
            }
          });
        }
      });

      const totalClients = allClientIds.size;

      return { totalDemand, totalTasks, totalClients };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { totalDemand: 0, totalTasks: 0, totalClients: 0 };
    }
  }

  /**
   * Generate skill summary safely
   */
  static generateSkillSummary(dataPoints: DemandDataPoint[]): SkillSummary {
    try {
      const summary: SkillSummary = {};

      for (const point of dataPoints) {
        if (!point || typeof point.skillType !== 'string') continue;

        const skill = point.skillType;
        if (!summary[skill]) {
          summary[skill] = { totalHours: 0, taskCount: 0, clientCount: 0 };
        }

        summary[skill].totalHours += Math.max(0, point.demandHours || 0);
        summary[skill].taskCount += Math.max(0, point.taskCount || 0);
        summary[skill].clientCount += Math.max(0, point.clientCount || 0);
      }

      return summary;
    } catch (error) {
      console.error('Error generating skill summary:', error);
      return {};
    }
  }
}
