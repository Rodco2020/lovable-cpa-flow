
import { DemandMatrixData, DemandFilters } from '@/types/demand';

/**
 * Base Filter Strategy Interface
 * 
 * Defines the contract for all filtering strategies in the demand matrix system.
 * Each filter strategy implements this interface to provide consistent filtering behavior.
 */
export interface BaseFilterStrategy {
  /**
   * Apply the specific filter to the demand matrix data
   * 
   * @param data - The original demand matrix data
   * @param filters - The current filter state
   * @returns Filtered demand matrix data
   */
  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData;

  /**
   * Check if this filter strategy should be applied based on current filters
   * 
   * @param filters - The current filter state
   * @returns True if this filter should be applied
   */
  shouldApply(filters: DemandFilters): boolean;

  /**
   * Get the name/identifier of this filter strategy
   */
  getName(): string;

  /**
   * Get priority for filter application order (lower numbers applied first)
   */
  getPriority(): number;
}

/**
 * Abstract Base Filter Strategy
 * 
 * Provides common functionality for all filter strategies
 */
export abstract class AbstractFilterStrategy implements BaseFilterStrategy {
  protected readonly name: string;
  protected readonly priority: number;

  constructor(name: string, priority: number = 10) {
    this.name = name;
    this.priority = priority;
  }

  abstract apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData;
  abstract shouldApply(filters: DemandFilters): boolean;

  getName(): string {
    return this.name;
  }

  getPriority(): number {
    return this.priority;
  }

  /**
   * Helper method to recalculate totals after filtering
   */
  protected recalculateTotals(data: DemandMatrixData, filteredDataPoints: any[]): DemandMatrixData {
    const remainingSkills = new Set(filteredDataPoints.map(p => p.skillType));
    const remainingMonths = new Set(filteredDataPoints.map(p => p.month));

    return {
      ...data,
      skills: data.skills.filter(skill => remainingSkills.has(skill)),
      months: data.months.filter(month => remainingMonths.has(month.key)),
      dataPoints: filteredDataPoints,
      totalDemand: filteredDataPoints.reduce((sum, point) => sum + point.demandHours, 0),
      totalTasks: filteredDataPoints.reduce((sum, point) => sum + point.taskCount, 0),
      totalClients: new Set(
        filteredDataPoints.flatMap(point => 
          point.taskBreakdown?.map(task => task.clientId) || []
        )
      ).size
    };
  }
}
