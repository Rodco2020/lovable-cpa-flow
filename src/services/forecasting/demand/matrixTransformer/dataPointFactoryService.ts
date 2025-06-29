
import { DemandDataPoint, ClientTaskDemand } from '@/types/demand';
import { RevenueCalculationService } from './revenueCalculationService';

/**
 * Data Point Factory Service
 * Handles creation of data points with all required fields
 */
export class DataPointFactoryService {
  /**
   * Create a complete data point with all calculations
   */
  static createDataPoint(
    month: { key: string; label: string },
    skill: string,
    demandCalculation: {
      totalDemand: number;
      totalTasks: number;
      totalClients: number;
    },
    taskBreakdown: ClientTaskDemand[],
    revenueContext?: any
  ): DemandDataPoint {
    // Calculate revenue if enabled
    const { suggestedRevenue, expectedLessSuggested } = RevenueCalculationService.calculateDataPointRevenue(
      demandCalculation.totalDemand,
      skill,
      revenueContext
    );

    return {
      skillType: skill,
      month: month.key,
      monthLabel: month.label,
      demandHours: demandCalculation.totalDemand,
      taskCount: demandCalculation.totalTasks,
      clientCount: demandCalculation.totalClients,
      taskBreakdown,
      // Include revenue properties (optional)
      ...(suggestedRevenue !== undefined && { suggestedRevenue }),
      ...(expectedLessSuggested !== undefined && { expectedLessSuggested })
    };
  }

  /**
   * Create a fallback data point when generation fails
   */
  static createFallbackDataPoint(
    month: { key: string; label: string },
    skill: string
  ): DemandDataPoint {
    return {
      skillType: skill,
      month: month.key,
      monthLabel: month.label,
      demandHours: 0,
      taskCount: 0,
      clientCount: 0,
      taskBreakdown: [],
      // Include fallback revenue properties
      suggestedRevenue: 0,
      expectedLessSuggested: 0
    };
  }
}
