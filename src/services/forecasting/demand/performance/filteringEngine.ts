
/**
 * Filtering Engine for Performance Module
 */

export interface FilteringMetrics {
  itemsProcessed: number;
  itemsFiltered: number;
  processingTime: number;
}

export interface FilteringPerformanceStats {
  averageProcessingTime: number;
  totalItemsProcessed: number;
  filterEfficiency: number;
}

export class FilteringEngine {
  private static metrics: FilteringMetrics[] = [];

  static filter<T>(
    items: T[],
    filters: Array<(item: T) => boolean>
  ): { results: T[]; metrics: FilteringMetrics } {
    const startTime = Date.now();
    
    let results = items;
    for (const filter of filters) {
      results = results.filter(filter);
    }
    
    const processingTime = Date.now() - startTime;
    const metrics: FilteringMetrics = {
      itemsProcessed: items.length,
      itemsFiltered: results.length,
      processingTime
    };

    this.metrics.push(metrics);
    return { results, metrics };
  }

  static getPerformanceStats(): FilteringPerformanceStats {
    if (this.metrics.length === 0) {
      return {
        averageProcessingTime: 0,
        totalItemsProcessed: 0,
        filterEfficiency: 0
      };
    }

    const totalTime = this.metrics.reduce((sum, m) => sum + m.processingTime, 0);
    const totalItems = this.metrics.reduce((sum, m) => sum + m.itemsProcessed, 0);
    const totalFiltered = this.metrics.reduce((sum, m) => sum + m.itemsFiltered, 0);

    return {
      averageProcessingTime: totalTime / this.metrics.length,
      totalItemsProcessed: totalItems,
      filterEfficiency: totalItems > 0 ? totalFiltered / totalItems : 0
    };
  }
}
