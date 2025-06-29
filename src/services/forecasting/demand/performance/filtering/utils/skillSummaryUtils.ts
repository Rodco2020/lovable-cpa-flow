
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

    return summaries.reduce((acc, current) => {
      // Convert the partial to a complete item by providing defaults
      const completeItem: SkillSummaryItem = {
        totalHours: current.totalHours || 0,
        demandHours: current.demandHours || 0,
        taskCount: current.taskCount || 0,
        clientCount: current.clientCount || 0,
        revenue: current.revenue || 0,
        hourlyRate: current.hourlyRate || 0,
        suggestedRevenue: current.suggestedRevenue || 0,
        expectedLessSuggested: current.expectedLessSuggested || 0,
        totalSuggestedRevenue: current.totalSuggestedRevenue || 0,
        totalExpectedLessSuggested: current.totalExpectedLessSuggested || 0,
        averageFeeRate: current.averageFeeRate || 0
      };

      return {
        totalHours: acc.totalHours + completeItem.totalHours,
        demandHours: acc.demandHours + completeItem.demandHours,
        taskCount: acc.taskCount + completeItem.taskCount,
        clientCount: acc.clientCount + completeItem.clientCount,
        revenue: acc.revenue + completeItem.revenue,
        hourlyRate: acc.hourlyRate || completeItem.hourlyRate,
        suggestedRevenue: acc.suggestedRevenue + completeItem.suggestedRevenue,
        expectedLessSuggested: acc.expectedLessSuggested + completeItem.expectedLessSuggested,
        totalSuggestedRevenue: acc.totalSuggestedRevenue + completeItem.totalSuggestedRevenue,
        totalExpectedLessSuggested: acc.totalExpectedLessSuggested + completeItem.totalExpectedLessSuggested,
        averageFeeRate: acc.averageFeeRate || completeItem.averageFeeRate
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
