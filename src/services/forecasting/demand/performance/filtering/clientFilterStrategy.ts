
import { DemandMatrixData, DemandFilters } from '@/types/demand';
import { AbstractFilterStrategy } from './baseFilterStrategy';

/**
 * Client Filter Strategy
 * 
 * Handles filtering of demand matrix data by selected clients.
 * Maintains existing behavior where empty clients array means "show all clients".
 */
export class ClientFilterStrategy extends AbstractFilterStrategy {
  constructor() {
    super('client-filter', 2); // Applied after skill filter
  }

  shouldApply(filters: DemandFilters): boolean {
    // Apply client filter only if we have specific clients selected
    // Empty array or null/undefined means "show all clients"
    return !!(filters.clients && filters.clients.length > 0);
  }

  apply(data: DemandMatrixData, filters: DemandFilters): DemandMatrixData {
    if (!this.shouldApply(filters)) {
      return data; // No filtering needed
    }

    console.log(`🎯 [CLIENT FILTER] Applying client filter with ${filters.clients!.length} selected clients`);

    const clientSet = new Set(filters.clients!);
    
    // Filter data points by selected clients
    const filteredDataPoints = data.dataPoints.filter(point => {
      // Check if any task in the breakdown matches selected clients
      const hasMatchingClient = point.taskBreakdown?.some(task => 
        clientSet.has(task.clientId)
      );
      return hasMatchingClient;
    });

    const result = this.recalculateTotals(data, filteredDataPoints);

    console.log(`✅ [CLIENT FILTER] Filtered from ${data.dataPoints.length} to ${result.dataPoints.length} data points`);

    return result;
  }
}
