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
  static mergeSkillSummaries(summaries: Partial<SkillSummaryItem>[]): SkillSummaryItem {
    if (summaries.length === 0) {
      return {
        totalHours: 0,
        demandHours: 0,
        taskCount: 0,
        clientCount: 0
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

    return summaries.reduce((acc: SkillSummaryItem, current: Partial<SkillSummaryItem>): SkillSummaryItem => {
      return {
        totalHours: acc.totalHours + (current.totalHours || 0),
        demandHours: acc.demandHours + (current.demandHours || 0),
        taskCount: acc.taskCount + (current.taskCount || 0),
        clientCount: acc.clientCount + (current.clientCount || 0),
        revenue: (acc.revenue || 0) + (current.revenue || 0),
        hourlyRate: acc.hourlyRate || current.hourlyRate || 0,
        suggestedRevenue: (acc.suggestedRevenue || 0) + (current.suggestedRevenue || 0),
        expectedLessSuggested: (acc.expectedLessSuggested || 0) + (current.expectedLessSuggested || 0),
        totalSuggestedRevenue: (acc.totalSuggestedRevenue || 0) + (current.totalSuggestedRevenue || 0),
        totalExpectedLessSuggested: (acc.totalExpectedLessSuggested || 0) + (current.totalExpectedLessSuggested || 0),
        averageFeeRate: acc.averageFeeRate || current.averageFeeRate || 0
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
