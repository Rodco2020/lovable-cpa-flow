
import { SkillSummaryItem } from '@/types/demand';

/**
 * Skill Summary Utilities
 * 
 * Provides utility functions for working with skill summary data
 */
export class SkillSummaryUtils {
  
  /**
   * Merge multiple skill summaries into one
   */
  static mergeSkillSummaries(summaries: SkillSummaryItem[]): SkillSummaryItem {
    if (summaries.length === 0) {
      return {
        totalHours: 0,
        demandHours: 0,
        taskCount: 0,
        clientCount: 0,
        revenue: 0,
        hourlyRate: 0,
        suggestedRevenue: 0,
        expectedLessSuggested: 0,
        totalSuggestedRevenue: 0,
        totalExpectedLessSuggested: 0,
        averageFeeRate: 0
      };
    }
    
    // Initialize with a complete SkillSummaryItem
    const initialValue: SkillSummaryItem = {
      totalHours: 0,
      demandHours: 0,
      taskCount: 0,
      clientCount: 0,
      revenue: 0,
      hourlyRate: 0,
      suggestedRevenue: 0,
      expectedLessSuggested: 0,
      totalSuggestedRevenue: 0,
      totalExpectedLessSuggested: 0,
      averageFeeRate: 0
    };

    return summaries.reduce((acc, current) => {
      return {
        totalHours: acc.totalHours + current.totalHours,
        demandHours: acc.demandHours + current.demandHours,
        taskCount: acc.taskCount + current.taskCount,
        clientCount: acc.clientCount + current.clientCount,
        revenue: acc.revenue + current.revenue,
        hourlyRate: acc.hourlyRate || current.hourlyRate,
        suggestedRevenue: acc.suggestedRevenue + current.suggestedRevenue,
        expectedLessSuggested: acc.expectedLessSuggested + current.expectedLessSuggested,
        totalSuggestedRevenue: acc.totalSuggestedRevenue + current.totalSuggestedRevenue,
        totalExpectedLessSuggested: acc.totalExpectedLessSuggested + current.totalExpectedLessSuggested,
        averageFeeRate: acc.averageFeeRate || current.averageFeeRate
      };
    }, initialValue);
  }
  
  /**
   * Calculate average values from skill summaries
   */
  static calculateAverages(summaries: SkillSummaryItem[]): {
    averageHours: number;
    averageRevenue: number;
    averageRate: number;
  } {
    if (summaries.length === 0) {
      return {
        averageHours: 0,
        averageRevenue: 0,
        averageRate: 0
      };
    }
    
    const totals = summaries.reduce((acc, summary) => ({
      totalHours: acc.totalHours + (summary.totalHours || 0),
      totalRevenue: acc.totalRevenue + (summary.revenue || 0),
      totalRate: acc.totalRate + (summary.hourlyRate || 0)
    }), { totalHours: 0, totalRevenue: 0, totalRate: 0 });
    
    return {
      averageHours: totals.totalHours / summaries.length,
      averageRevenue: totals.totalRevenue / summaries.length,
      averageRate: totals.totalRate / summaries.length
    };
  }
}
