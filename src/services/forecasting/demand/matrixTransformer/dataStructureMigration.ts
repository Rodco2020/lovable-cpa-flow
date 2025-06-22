
import { DemandMatrixData, DemandDataPoint, SkillSummary, ClientRevenueData } from '@/types/demand';
import { debugLog } from '../../logger';

/**
 * Data Structure Migration Service
 * 
 * Handles migration and transformation of legacy data structures
 * to maintain backward compatibility while supporting new features.
 */
export class DataStructureMigration {
  /**
   * Migrate legacy matrix data to current format
   */
  static migrateToCurrentFormat(legacyData: any): DemandMatrixData {
    debugLog('Migrating legacy data structure');

    return {
      months: legacyData.months || [],
      skills: legacyData.skills || [],
      dataPoints: legacyData.dataPoints || [],
      totalDemand: legacyData.totalDemand || 0,
      totalTasks: legacyData.totalTasks || 0,
      totalClients: legacyData.totalClients || 0,
      skillSummary: this.migrateSkillSummary(legacyData.skillSummary),
      clientTotals: legacyData.clientTotals,
      clientRevenue: legacyData.clientRevenue,
      clientHourlyRates: legacyData.clientHourlyRates,
      clientSuggestedRevenue: legacyData.clientSuggestedRevenue,
      clientExpectedLessSuggested: legacyData.clientExpectedLessSuggested,
      revenueTotals: this.migrateRevenueTotals(legacyData.revenueTotals),
      availableClients: legacyData.availableClients,
      availablePreferredStaff: legacyData.availablePreferredStaff
    };
  }

  /**
   * Migrate revenue totals to include all required properties
   */
  private static migrateRevenueTotals(revenueTotals: any) {
    if (!revenueTotals) return undefined;

    return {
      totalRevenue: revenueTotals.totalRevenue || revenueTotals.totalSuggestedRevenue || 0,
      totalSuggestedRevenue: revenueTotals.totalSuggestedRevenue || 0,
      totalExpectedLessSuggested: revenueTotals.totalExpectedLessSuggested || 0,
      totalExpectedRevenue: revenueTotals.totalExpectedRevenue
    };
  }

  /**
   * Ensure skill summary is properly formatted as array
   */
  private static migrateSkillSummary(skillSummary: any): SkillSummary[] {
    if (!skillSummary) return [];
    
    // If it's already an array, return as is
    if (Array.isArray(skillSummary)) {
      return skillSummary;
    }

    // If it's an object, convert to array
    if (typeof skillSummary === 'object') {
      return Object.entries(skillSummary).map(([skillType, data]: [string, any]) => ({
        skillType,
        totalDemand: data.totalHours || 0,
        totalHours: data.totalHours || 0,
        taskCount: data.taskCount || 0,
        clientCount: data.clientCount || 0,
        totalSuggestedRevenue: data.totalSuggestedRevenue || 0,
        totalExpectedLessSuggested: data.totalExpectedLessSuggested || 0,
        averageFeeRate: data.averageFeeRate || 0
      }));
    }

    return [];
  }

  /**
   * Enhance data points with revenue calculations
   */
  static enhanceWithRevenueData(
    dataPoints: DemandDataPoint[],
    clientRevenueMap: Map<string, ClientRevenueData>
  ): DemandDataPoint[] {
    return dataPoints.map(point => {
      if (!point.taskBreakdown) return point;

      let totalSuggestedRevenue = 0;
      let totalExpectedLessSuggested = 0;

      point.taskBreakdown.forEach(task => {
        const clientRevenue = clientRevenueMap.get(task.clientId);
        if (clientRevenue) {
          // Calculate suggested revenue based on hours
          const suggestedRevenue = task.monthlyHours * (clientRevenue.suggestedRevenue / task.monthlyHours || 0);
          const expectedRevenue = task.monthlyHours * (clientRevenue.expectedRevenue / task.monthlyHours || 0);
          
          totalSuggestedRevenue += suggestedRevenue;
          totalExpectedLessSuggested += (expectedRevenue - suggestedRevenue);
        }
      });

      return {
        ...point,
        suggestedRevenue: totalSuggestedRevenue,
        expectedLessSuggested: totalExpectedLessSuggested
      };
    });
  }

  /**
   * Calculate client revenue summaries
   */
  static calculateClientRevenueSummaries(
    dataPoints: DemandDataPoint[]
  ): Map<string, ClientRevenueData> {
    const clientSummaries = new Map<string, ClientRevenueData>();

    dataPoints.forEach(point => {
      point.taskBreakdown?.forEach(task => {
        const existing = clientSummaries.get(task.clientId);
        
        if (existing) {
          // Accumulate data
          existing.suggestedRevenue += task.monthlyHours * 100; // Placeholder rate
          existing.variance = existing.expectedRevenue - existing.suggestedRevenue;
        } else {
          // Create new entry
          clientSummaries.set(task.clientId, {
            clientId: task.clientId,
            clientName: task.clientName,
            expectedRevenue: task.monthlyHours * 120, // Placeholder rate
            suggestedRevenue: task.monthlyHours * 100,
            variance: task.monthlyHours * 20,
            utilizationRate: 85 // Placeholder
          });
        }
      });
    });

    return clientSummaries;
  }
}
