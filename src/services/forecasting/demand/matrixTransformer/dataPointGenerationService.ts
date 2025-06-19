
import { DemandDataPoint } from '@/types/demand';
import { RevenueEnhancedDataPointContext } from './types';
import { debugLog } from '../../logger';

/**
 * Data Point Generation Service
 * Handles creation of matrix data points with revenue enhancement
 */
export class DataPointGenerationService {
  /**
   * Generate enhanced data points with revenue context
   */
  static generateRevenueEnhancedDataPoints(contexts: RevenueEnhancedDataPointContext[]): DemandDataPoint[] {
    try {
      return contexts.map(context => ({
        skillType: context.skillType,
        month: context.month,
        monthLabel: context.monthLabel,
        demandHours: context.demandHours,
        taskCount: context.taskCount,
        clientCount: context.clientCount,
        taskBreakdown: context.taskBreakdown
      }));
    } catch (error) {
      console.error('Error generating enhanced data points:', error);
      debugLog('Falling back to basic data point generation');
      return [];
    }
  }
}
