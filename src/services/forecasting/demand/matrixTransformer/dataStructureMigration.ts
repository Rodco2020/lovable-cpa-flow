/**
 * Data Structure Migration Utility
 * 
 * Provides utilities for migrating between legacy and new demand matrix data structures
 * while maintaining backward compatibility during the Phase 3 implementation.
 */

import { 
  DemandMatrixData, 
  LegacyDemandMatrixData, 
  DemandDataPoint, 
  ClientRevenueData,
  hasRevenueData,
  MatrixRevenueComparison 
} from '@/types/demand';
import { suggestedRevenueCalculator } from '../calculators/SuggestedRevenueCalculator';
import { getSkillFeeRatesMap } from '@/services/skills/feeRateService';

export class DataStructureMigrationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DataStructureMigrationError';
  }
}

/**
 * Migration service for handling data structure updates
 */
export class DataStructureMigrationService {
  private static instance: DataStructureMigrationService;

  private constructor() {}

  public static getInstance(): DataStructureMigrationService {
    if (!DataStructureMigrationService.instance) {
      DataStructureMigrationService.instance = new DataStructureMigrationService();
    }
    return DataStructureMigrationService.instance;
  }

  /**
   * Migrate legacy demand matrix data to new structure with revenue fields
   * @param legacyData - Legacy demand matrix data
   * @param clientRevenueData - Client revenue information for calculations
   * @returns Enhanced demand matrix data with revenue fields
   */
  public async migrateLegacyToEnhanced(
    legacyData: LegacyDemandMatrixData,
    clientRevenueData: ClientRevenueData[] = []
  ): Promise<DemandMatrixData> {
    try {
      console.log('Starting migration from legacy to enhanced data structure');

      // Get skill fee rates for revenue calculations
      const skillFeeRates = await getSkillFeeRatesMap();

      // Create base enhanced structure
      const enhancedData: DemandMatrixData = {
        ...legacyData,
        clientSuggestedRevenue: new Map(),
        clientExpectedLessSuggested: new Map(),
        revenueTotals: {
          totalSuggestedRevenue: 0,
          totalExpectedRevenue: 0,
          totalExpectedLessSuggested: 0
        }
      };

      // Enhance data points with revenue calculations
      enhancedData.dataPoints = await this.enhanceDataPointsWithRevenue(
        legacyData.dataPoints,
        skillFeeRates
      );

      // Calculate client-level revenue totals
      await this.calculateClientRevenueTotals(enhancedData, clientRevenueData);

      // Enhance skill summary with revenue information
      this.enhanceSkillSummaryWithRevenue(enhancedData, skillFeeRates);

      // Calculate matrix-level revenue totals
      this.calculateMatrixRevenueTotals(enhancedData);

      console.log('Successfully migrated legacy data structure to enhanced format');

      return enhancedData;
    } catch (error) {
      const errorMessage = `Failed to migrate legacy data structure: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      throw new DataStructureMigrationError(errorMessage, 'MIGRATION_ERROR');
    }
  }

  /**
   * Safely access data regardless of structure version
   * @param data - Data in either legacy or enhanced format
   * @returns Normalized access to data properties
   */
  public safeDataAccess(data: DemandMatrixData | LegacyDemandMatrixData) {
    const hasRevenue = hasRevenueData(data);

    return {
      // Core properties (available in both versions)
      months: data.months,
      skills: data.skills,
      dataPoints: data.dataPoints,
      totalDemand: data.totalDemand,
      totalTasks: data.totalTasks,
      totalClients: data.totalClients,
      skillSummary: data.skillSummary,
      clientTotals: data.clientTotals,
      clientRevenue: data.clientRevenue,
      clientHourlyRates: data.clientHourlyRates,

      // Revenue properties (only in enhanced version)
      clientSuggestedRevenue: hasRevenue ? data.clientSuggestedRevenue : undefined,
      clientExpectedLessSuggested: hasRevenue ? data.clientExpectedLessSuggested : undefined,
      revenueTotals: hasRevenue ? data.revenueTotals : undefined,

      // Metadata
      hasRevenueData: hasRevenue,
      dataStructureVersion: hasRevenue ? 'enhanced' : 'legacy'
    };
  }

  /**
   * Validate data structure integrity after migration
   * @param data - Enhanced data structure to validate
   * @returns Validation result with issues if any
   */
  public validateEnhancedDataStructure(data: DemandMatrixData): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate core structure
      if (!data.months || data.months.length === 0) {
        issues.push('Months array is missing or empty');
      }

      if (!data.skills || data.skills.length === 0) {
        issues.push('Skills array is missing or empty');
      }

      if (!data.dataPoints || data.dataPoints.length === 0) {
        issues.push('Data points array is missing or empty');
      }

      // Validate revenue structure if present
      if (hasRevenueData(data)) {
        // Check revenue totals
        if (!data.revenueTotals) {
          warnings.push('Revenue totals are missing');
        }

        // Check data point revenue fields
        const dataPointsWithRevenue = data.dataPoints.filter(dp => 
          dp.suggestedRevenue !== undefined || dp.expectedLessSuggested !== undefined
        );

        if (dataPointsWithRevenue.length === 0) {
          warnings.push('No data points contain revenue information');
        }

        // Check skill summary revenue fields
        const skillsWithRevenue = Object.values(data.skillSummary).filter(skill =>
          skill.totalSuggestedRevenue !== undefined || skill.totalExpectedLessSuggested !== undefined
        );

        if (skillsWithRevenue.length === 0) {
          warnings.push('No skills contain revenue summary information');
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        warnings
      };
    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        warnings
      };
    }
  }

  /**
   * Generate backward compatibility wrapper
   * @param enhancedData - Enhanced data structure
   * @returns Legacy-compatible data structure
   */
  public createLegacyCompatibleWrapper(enhancedData: DemandMatrixData): LegacyDemandMatrixData {
    return {
      months: enhancedData.months,
      skills: enhancedData.skills,
      dataPoints: enhancedData.dataPoints.map(dp => ({
        skillType: dp.skillType,
        month: dp.month,
        monthLabel: dp.monthLabel,
        demandHours: dp.demandHours,
        taskCount: dp.taskCount,
        clientCount: dp.clientCount,
        taskBreakdown: dp.taskBreakdown
      })),
      totalDemand: enhancedData.totalDemand,
      totalTasks: enhancedData.totalTasks,
      totalClients: enhancedData.totalClients,
      skillSummary: Object.fromEntries(
        Object.entries(enhancedData.skillSummary).map(([key, value]) => [
          key,
          {
            totalHours: value.totalHours,
            taskCount: value.taskCount,
            clientCount: value.clientCount
          }
        ])
      ),
      clientTotals: enhancedData.clientTotals,
      clientRevenue: enhancedData.clientRevenue,
      clientHourlyRates: enhancedData.clientHourlyRates
    };
  }

  private async enhanceDataPointsWithRevenue(
    dataPoints: Array<Omit<DemandDataPoint, 'suggestedRevenue' | 'expectedLessSuggested'>>,
    skillFeeRates: Map<string, number>
  ): Promise<DemandDataPoint[]> {
    return dataPoints.map(point => {
      try {
        const suggestedRevenue = suggestedRevenueCalculator.calculateSuggestedRevenue(
          point.demandHours,
          point.skillType,
          skillFeeRates
        );

        return {
          ...point,
          suggestedRevenue,
          expectedLessSuggested: 0 // Will be calculated at client level
        };
      } catch (error) {
        console.warn(`Failed to calculate revenue for data point ${point.skillType}/${point.month}:`, error);
        return {
          ...point,
          suggestedRevenue: 0,
          expectedLessSuggested: 0
        };
      }
    });
  }

  private async calculateClientRevenueTotals(
    data: DemandMatrixData,
    clientRevenueData: ClientRevenueData[]
  ): Promise<void> {
    if (!data.clientSuggestedRevenue || !data.clientExpectedLessSuggested) {
      return;
    }

    const clientRevenueMap = new Map(
      clientRevenueData.map(client => [client.clientId, client])
    );

    // Group data points by client to calculate totals
    const clientDataPoints = new Map<string, DemandDataPoint[]>();
    
    data.dataPoints.forEach(point => {
      if (point.taskBreakdown) {
        point.taskBreakdown.forEach(task => {
          if (!clientDataPoints.has(task.clientId)) {
            clientDataPoints.set(task.clientId, []);
          }
          clientDataPoints.get(task.clientId)!.push(point);
        });
      }
    });

    // Calculate totals for each client
    clientDataPoints.forEach((points, clientId) => {
      const totalSuggestedRevenue = points.reduce((sum, point) => 
        sum + (point.suggestedRevenue || 0), 0
      );

      const clientData = clientRevenueMap.get(clientId);
      const expectedRevenue = clientData?.expectedMonthlyRevenue || 0;
      const expectedLessSuggested = suggestedRevenueCalculator.calculateExpectedLessSuggested(
        expectedRevenue,
        totalSuggestedRevenue
      );

      data.clientSuggestedRevenue!.set(clientId, totalSuggestedRevenue);
      data.clientExpectedLessSuggested!.set(clientId, expectedLessSuggested);
    });
  }

  private enhanceSkillSummaryWithRevenue(
    data: DemandMatrixData,
    skillFeeRates: Map<string, number>
  ): void {
    Object.keys(data.skillSummary).forEach(skillName => {
      const skillData = data.skillSummary[skillName];
      const feeRate = skillFeeRates.get(skillName) || 75.00; // Default fallback rate

      skillData.totalSuggestedRevenue = skillData.totalHours * feeRate;
      skillData.totalExpectedLessSuggested = 0; // Will be calculated based on client expectations
      skillData.averageFeeRate = feeRate;
    });
  }

  private calculateMatrixRevenueTotals(data: DemandMatrixData): void {
    if (!data.revenueTotals) {
      return;
    }

    // Calculate total suggested revenue from data points
    data.revenueTotals.totalSuggestedRevenue = data.dataPoints.reduce((sum, point) => 
      sum + (point.suggestedRevenue || 0), 0
    );

    // Calculate total expected revenue from client data
    if (data.clientRevenue) {
      data.revenueTotals.totalExpectedRevenue = Array.from(data.clientRevenue.values())
        .reduce((sum, revenue) => sum + revenue, 0);
    }

    // Calculate expected less suggested
    data.revenueTotals.totalExpectedLessSuggested = 
      data.revenueTotals.totalExpectedRevenue - data.revenueTotals.totalSuggestedRevenue;
  }
}

// Export singleton instance
export const dataStructureMigrationService = DataStructureMigrationService.getInstance();
