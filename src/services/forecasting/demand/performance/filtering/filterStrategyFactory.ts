
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { BaseFilterStrategy } from './baseFilterStrategy';
import { SkillFilterStrategy } from './skillFilterStrategy';
import { ClientFilterStrategy } from './clientFilterStrategy';
import { TimeHorizonFilterStrategy } from './timeHorizonFilterStrategy';

/**
 * Filter Strategy Factory
 * 
 * Manages all available filter strategies and provides a unified interface
 * for applying filters to demand matrix data. Uses the strategy pattern
 * to enable flexible, testable, and maintainable filtering logic.
 */
export class FilterStrategyFactory {
  private static strategies: BaseFilterStrategy[] = [
    new SkillFilterStrategy(),
    new ClientFilterStrategy(),
    new TimeHorizonFilterStrategy()
  ];

  /**
   * Apply all applicable filters to the demand matrix data
   * 
   * Filters are applied in priority order (lower priority numbers first).
   * Only strategies that indicate they should apply are executed.
   * 
   * @param data - Original demand matrix data
   * @param filters - Current filter state
   * @returns Filtered demand matrix data
   */
  static applyFilters(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    console.log(`🔍 [FILTER FACTORY] Starting filter application with ${this.strategies.length} available strategies`);

    // Sort strategies by priority (lower numbers first)
    const sortedStrategies = [...this.strategies].sort((a, b) => a.getPriority() - b.getPriority());

    // Apply each applicable strategy in sequence
    let filteredData = data;
    const appliedFilters: string[] = [];

    for (const strategy of sortedStrategies) {
      if (strategy.shouldApply(filters)) {
        filteredData = strategy.apply(filteredData, filters);
        appliedFilters.push(strategy.getName());
      }
    }

    console.log(`✅ [FILTER FACTORY] Applied ${appliedFilters.length} filters: ${appliedFilters.join(', ')}`);
    console.log(`📊 [FILTER FACTORY] Final results: ${filteredData.dataPoints.length} data points, ${filteredData.skills.length} skills, ${filteredData.totalClients} clients`);

    return filteredData;
  }

  /**
   * Register a new filter strategy
   * 
   * @param strategy - The filter strategy to register
   */
  static registerStrategy(strategy: BaseFilterStrategy): void {
    // Remove existing strategy with same name if it exists
    this.strategies = this.strategies.filter(s => s.getName() !== strategy.getName());
    
    // Add new strategy
    this.strategies.push(strategy);
    
    console.log(`🔧 [FILTER FACTORY] Registered strategy: ${strategy.getName()}`);
  }

  /**
   * Get all registered strategies (for testing/debugging)
   */
  static getStrategies(): BaseFilterStrategy[] {
    return [...this.strategies];
  }

  /**
   * Get a specific strategy by name
   */
  static getStrategy(name: string): BaseFilterStrategy | undefined {
    return this.strategies.find(s => s.getName() === name);
  }

  /**
   * Check if any filters are active
   * 
   * @param filters - Current filter state
   * @returns True if any filter strategy should be applied
   */
  static hasActiveFilters(filters: DemandFilters): boolean {
    return this.strategies.some(strategy => strategy.shouldApply(filters));
  }

  /**
   * Get list of active filter names
   * 
   * @param filters - Current filter state
   * @returns Array of active filter strategy names
   */
  static getActiveFilterNames(filters: DemandFilters): string[] {
    return this.strategies
      .filter(strategy => strategy.shouldApply(filters))
      .map(strategy => strategy.getName());
  }
}
