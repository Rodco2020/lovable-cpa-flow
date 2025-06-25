
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AbstractFilterStrategy } from './baseFilterStrategy';

/**
 * Time Horizon Filter Strategy
 * 
 * Handles filtering of demand matrix data by time range.
 * Filters data points that fall outside the specified time horizon.
 */
export class TimeHorizonFilterStrategy extends AbstractFilterStrategy {
  constructor() {
    super('time-horizon-filter', 3); // Applied after skill and client filters
  }

  shouldApply(filters: DemandFilters): boolean {
    return !!(filters.timeHorizon && filters.timeHorizon.start && filters.timeHorizon.end);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      return data; // No filtering needed
    }

    const { start, end } = filters.timeHorizon!;
    console.log(`🎯 [TIME FILTER] Applying time horizon filter: ${start.toISOString()} to ${end.toISOString()}`);

    // Filter data points by time horizon
    const filteredDataPoints = data.dataPoints.filter(point => {
      const pointDate = new Date(point.month);
      return pointDate >= start && pointDate <= end;
    });

    const result = this.recalculateTotals(data, filteredDataPoints);

    console.log(`✅ [TIME FILTER] Filtered from ${data.dataPoints.length} to ${result.dataPoints.length} data points`);

    return result;
  }
}
