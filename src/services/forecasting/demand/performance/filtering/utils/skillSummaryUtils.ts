
import { SkillSummaryItem } from '@/types/demand';

/**
 * Skill Summary Utilities
 * Helper functions for working with skill summary data
 */
export class SkillSummaryUtils {
  
  /**
   * Create an empty skill summary item
   */
  static createEmptySkillSummary(): SkillSummaryItem {
    return {
      totalHours: 0,
      demandHours: 0,
      taskCount: 0,
      clientCount: 0
    };
  }
  
  /**
   * Merge multiple skill summaries
   */
  static mergeSkillSummaries(summaries: SkillSummaryItem[]): SkillSummaryItem {
    return summaries.reduce((merged, summary) => ({
      totalHours: merged.totalHours + (summary.totalHours || 0),
      demandHours: merged.demandHours + (summary.demandHours || 0),
      taskCount: merged.taskCount + (summary.taskCount || 0),
      clientCount: merged.clientCount + (summary.clientCount || 0)
    }), this.createEmptySkillSummary());
  }
  
  /**
   * Calculate skill utilization percentage
   */
  static calculateUtilization(summary: SkillSummaryItem): number {
    if (!summary.totalHours || summary.totalHours === 0) return 0;
    return (summary.demandHours / summary.totalHours) * 100;
  }
  
  /**
   * Validate skill summary data
   */
  static validateSkillSummary(summary: SkillSummaryItem): boolean {
    return summary.totalHours >= 0 &&
           summary.demandHours >= 0 &&
           summary.taskCount >= 0 &&
           summary.clientCount >= 0 &&
           summary.demandHours <= summary.totalHours;
  }
}
