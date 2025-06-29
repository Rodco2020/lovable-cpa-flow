
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
    
    return summaries.reduce((merged, current) => ({
      totalHours: (merged.totalHours || 0) + (current.totalHours || 0),
      demandHours: (merged.demandHours || 0) + (current.demandHours || 0),
      taskCount: (merged.taskCount || 0) + (current.taskCount || 0),
      clientCount: (merged.clientCount || 0) + (current.clientCount || 0),
      revenue: (merged.revenue || 0) + (current.revenue || 0),
      hourlyRate: merged.hourlyRate || current.hourlyRate || 0,
      suggestedRevenue: (merged.suggestedRevenue || 0) + (current.suggestedRevenue || 0),
      expectedLessSuggested: (merged.expectedLessSuggested || 0) + (current.expectedLessSuggested || 0),
      totalSuggestedRevenue: (merged.totalSuggestedRevenue || 0) + (current.totalSuggestedRevenue || 0),
      totalExpectedLessSuggested: (merged.totalExpectedLessSuggested || 0) + (current.totalExpectedLessSuggested || 0),
      averageFeeRate: merged.averageFeeRate || current.averageFeeRate || 0
    }), {
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
    });
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
