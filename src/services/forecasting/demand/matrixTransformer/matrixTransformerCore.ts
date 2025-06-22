
import { DemandMatrixData, DemandDataPoint, SkillSummary } from '@/types/demand';
import { ForecastData } from '@/types/forecasting';
import { RecurringTaskDB } from '@/types/task';
import { debugLog } from '../../logger';
import { DataPointGenerationService } from './dataPointGenerationService';
import { DemandCalculationService } from './demandCalculationService';
import { DataStructureMigration } from './dataStructureMigration';

/**
 * Matrix Transformer Core - Refactored Implementation
 * 
 * This is the refactored core implementation that provides the same
 * functionality as the original MatrixTransformer but with improved
 * modularity, maintainability, and type safety.
 */
export class MatrixTransformerCore {
  /**
   * Transform forecast data to matrix format with fixed skill resolution
   */
  static async transformToMatrixData(
    forecastData: ForecastData[],
    tasks: RecurringTaskDB[]
  ): Promise<DemandMatrixData> {
    debugLog('MatrixTransformerCore: Starting transformation', {
      forecastDataLength: forecastData.length,
      tasksLength: tasks.length
    });

    try {
      // Extract date range from forecast data
      const { startDate, endDate } = this.extractDateRange(forecastData);
      
      // Generate data points from tasks
      const dataPoints = await DataPointGenerationService.generateDataPoints(
        tasks,
        startDate,
        endDate
      );

      // Calculate aggregated totals
      const totals = DemandCalculationService.aggregateDemandTotals(dataPoints);

      // Generate months info
      const months = this.generateMonthsInfo(startDate, endDate);

      // Extract unique skills
      const skills = this.extractUniqueSkills(dataPoints);

      // Generate skill summary
      const skillSummary = this.generateSkillSummary(dataPoints);

      const result: DemandMatrixData = {
        months,
        skills,
        dataPoints,
        totalDemand: totals.totalDemand,
        totalTasks: totals.totalTasks,
        totalClients: totals.totalClients,
        skillSummary: skillSummary
      };

      debugLog('MatrixTransformerCore: Transformation completed', {
        monthsCount: months.length,
        skillsCount: skills.length,
        dataPointsCount: dataPoints.length,
        totalDemand: totals.totalDemand
      });

      return result;

    } catch (error) {
      debugLog('MatrixTransformerCore: Transformation failed', { error });
      
      // Return minimal valid structure on error
      return {
        months: [],
        skills: [],
        dataPoints: [],
        totalDemand: 0,
        totalTasks: 0,
        totalClients: 0,
        skillSummary: []
      };
    }
  }

  /**
   * Extract date range from forecast data
   */
  private static extractDateRange(forecastData: ForecastData[]): { startDate: Date; endDate: Date } {
    if (forecastData.length === 0) {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 12, 0)
      };
    }

    const periods = forecastData
      .map(item => new Date(item.period + '-01'))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      startDate: periods[0],
      endDate: periods[periods.length - 1]
    };
  }

  /**
   * Generate months information
   */
  private static generateMonthsInfo(startDate: Date, endDate: Date) {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const key = current.toISOString().slice(0, 7); // YYYY-MM format
      const label = current.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      months.push({ key, label });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }

  /**
   * Extract unique skills from data points
   */
  private static extractUniqueSkills(dataPoints: DemandDataPoint[]): string[] {
    const skillsSet = new Set<string>();
    dataPoints.forEach(point => skillsSet.add(point.skillType));
    return Array.from(skillsSet).sort();
  }

  /**
   * Generate skill summary array from data points
   */
  private static generateSkillSummary(dataPoints: DemandDataPoint[]): SkillSummary[] {
    const skillMap = new Map<string, {
      totalHours: number;
      taskCount: number;
      clientCount: number;
    }>();

    // Aggregate by skill type
    dataPoints.forEach(point => {
      const existing = skillMap.get(point.skillType);
      if (existing) {
        existing.totalHours += point.demandHours;
        existing.taskCount += point.taskCount;
        existing.clientCount = Math.max(existing.clientCount, point.clientCount);
      } else {
        skillMap.set(point.skillType, {
          totalHours: point.demandHours,
          taskCount: point.taskCount,
          clientCount: point.clientCount
        });
      }
    });

    // Convert to array format
    return Array.from(skillMap.entries()).map(([skillType, data]) => ({
      skillType,
      totalDemand: data.totalHours,
      totalHours: data.totalHours,
      taskCount: data.taskCount,
      clientCount: data.clientCount
    }));
  }
}
