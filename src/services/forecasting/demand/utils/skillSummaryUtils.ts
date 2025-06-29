
import { SkillSummary, SkillSummaryItem } from '@/types/demand';

/**
 * Utility functions for creating and managing skill summaries
 */
export class SkillSummaryUtils {
  /**
   * Create a properly formatted SkillSummaryItem with all required properties
   */
  static createSkillSummaryItem(data: {
    demandHours?: number;
    totalHours?: number;
    taskCount: number;
    clientCount: number;
    revenue?: number;
    hourlyRate?: number;
    suggestedRevenue?: number;
    expectedLessSuggested?: number;
    totalSuggestedRevenue?: number;
    totalExpectedLessSuggested?: number;
    averageFeeRate?: number;
  }): SkillSummaryItem {
    // Use demandHours if provided, otherwise use totalHours, otherwise default to 0
    const demandHours = data.demandHours !== undefined ? data.demandHours : (data.totalHours || 0);
    const totalHours = data.totalHours !== undefined ? data.totalHours : demandHours;

    return {
      demandHours,
      totalHours,
      taskCount: data.taskCount || 0,
      clientCount: data.clientCount || 0,
      revenue: data.revenue,
      hourlyRate: data.hourlyRate,
      suggestedRevenue: data.suggestedRevenue,
      expectedLessSuggested: data.expectedLessSuggested,
      totalSuggestedRevenue: data.totalSuggestedRevenue,
      totalExpectedLessSuggested: data.totalExpectedLessSuggested,
      averageFeeRate: data.averageFeeRate
    };
  }

  /**
   * Convert legacy skill summary format to proper SkillSummary
   */
  static normalizeLegacySkillSummary(legacySummary: Record<string, any>): SkillSummary {
    const normalized: SkillSummary = {};

    for (const [skill, data] of Object.entries(legacySummary)) {
      normalized[skill] = this.createSkillSummaryItem({
        totalHours: data.totalHours,
        demandHours: data.demandHours || data.totalHours,
        taskCount: data.taskCount,
        clientCount: data.clientCount,
        revenue: data.revenue,
        hourlyRate: data.hourlyRate,
        suggestedRevenue: data.suggestedRevenue,
        expectedLessSuggested: data.expectedLessSuggested,
        totalSuggestedRevenue: data.totalSuggestedRevenue,
        totalExpectedLessSuggested: data.totalExpectedLessSuggested,
        averageFeeRate: data.averageFeeRate
      });
    }

    return normalized;
  }

  /**
   * Create a skill summary item from legacy data with proper demandHours mapping
   */
  static createFromLegacyData(legacyData: {
    totalHours: number;
    taskCount: number;
    clientCount: number;
    [key: string]: any;
  }): SkillSummaryItem {
    return this.createSkillSummaryItem({
      demandHours: legacyData.totalHours, // Map totalHours to demandHours
      totalHours: legacyData.totalHours,
      taskCount: legacyData.taskCount,
      clientCount: legacyData.clientCount,
      revenue: legacyData.revenue,
      hourlyRate: legacyData.hourlyRate,
      suggestedRevenue: legacyData.suggestedRevenue,
      expectedLessSuggested: legacyData.expectedLessSuggested,
      totalSuggestedRevenue: legacyData.totalSuggestedRevenue,
      totalExpectedLessSuggested: legacyData.totalExpectedLessSuggested,
      averageFeeRate: legacyData.averageFeeRate
    });
  }
}
