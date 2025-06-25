
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AbstractFilterStrategy } from './baseFilterStrategy';

/**
 * Skill Filter Strategy
 * 
 * Handles filtering of demand matrix data by selected skills.
 * Maintains existing behavior where empty skills array means "show all skills".
 */
export class SkillFilterStrategy extends AbstractFilterStrategy {
  constructor() {
    super('skill-filter', 1); // High priority - applied early
  }

  shouldApply(filters: DemandFilters): boolean {
    // Apply skill filter only if we have specific skills selected
    // Empty array or null/undefined means "show all skills"
    return !!(filters.skills && filters.skills.length > 0);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      return data; // No filtering needed
    }

    console.log(`🎯 [SKILL FILTER] Applying skill filter with ${filters.skills!.length} selected skills`);

    const skillSet = new Set(filters.skills!);
    
    // Filter data points by selected skills
    const filteredDataPoints = data.dataPoints.filter(point => {
      return skillSet.has(point.skillType);
    });

    const result = this.recalculateTotals(data, filteredDataPoints);

    console.log(`✅ [SKILL FILTER] Filtered from ${data.dataPoints.length} to ${result.dataPoints.length} data points`);

    return result;
  }
}
